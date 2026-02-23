const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const {
    validateReminderCreation,
    validateReminderUpdate,
    validateDoseLogging
} = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Utility: Get today's date string (YYYY-MM-DD)
const getTodayString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

// Get user's all reminders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reminders = await prisma.reminder.findMany({
            where: { userId: req.user.userId },
            include: { doses: true },
            orderBy: { time: 'asc' },
        });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// Get today's reminders only
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const today = getTodayString();
        const reminders = await prisma.reminder.findMany({
            where: { userId: req.user.userId },
            include: {
                doses: {
                    where: { date: today }
                }
            },
            orderBy: { time: 'asc' },
        });

        // Filter reminders that are active today based on repeat pattern
        const activeReminders = reminders.filter(reminder => {
            if (reminder.repeatType === 'none') return false; // One-time reminders not shown here
            if (reminder.repeatType === 'daily') return true;
            if (reminder.repeatType === 'specific-days') {
                const repeatDays = reminder.repeatDays ? JSON.parse(reminder.repeatDays) : [];
                const todayDayOfWeek = new Date().getDay();
                return repeatDays.includes(todayDayOfWeek);
            }
            return false;
        });

        res.json(activeReminders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch today\'s reminders' });
    }
});

// Create new reminder
router.post('/', authMiddleware, validateReminderCreation, async (req, res) => {
    try {
        const { title, category, description, time, repeatType, repeatDays } = req.body;

        const reminder = await prisma.reminder.create({
            data: {
                userId: req.user.userId,
                title,
                category: category || 'medication',
                description: description || null,
                time,
                repeatType: repeatType || 'daily',
                repeatDays: repeatDays ? JSON.stringify(repeatDays) : null,
                nextOccurrence: new Date(),
            },
            include: { doses: true }
        });

        res.status(201).json(reminder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create reminder' });
    }
});

// Update reminder
router.put('/:id', authMiddleware, validateReminderUpdate, async (req, res) => {
    try {
        const reminder = await prisma.reminder.findUnique({
            where: { id: req.params.id },
        });

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        if (reminder.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this reminder' });
        }

        const { title, category, description, time, repeatType, repeatDays } = req.body;

        const updated = await prisma.reminder.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(category && { category }),
                ...(description !== undefined && { description }),
                ...(time && { time }),
                ...(repeatType && { repeatType }),
                ...(repeatDays && { repeatDays: JSON.stringify(repeatDays) }),
            },
            include: { doses: true }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update reminder' });
    }
});

// Delete reminder
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const reminder = await prisma.reminder.findUnique({
            where: { id: req.params.id },
        });

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        if (reminder.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this reminder' });
        }

        await prisma.reminder.delete({
            where: { id: req.params.id },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});

// Log dose (taken, skipped, snoozed)
router.post('/:id/log-dose', authMiddleware, validateDoseLogging, async (req, res) => {
    try {
        const { date, status, snoozedUntil } = req.body; // status: 'taken', 'skipped', 'snoozed'
        const { id } = req.params;

        const reminder = await prisma.reminder.findUnique({ where: { id } });
        if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

        if (reminder.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const today = date || getTodayString();

        // Find or create dose record
        let dose = await prisma.dose.findUnique({
            where: { reminderId_date: { reminderId: id, date: today } }
        });

        if (!dose) {
            dose = await prisma.dose.create({
                data: {
                    reminderId: id,
                    date: today,
                    status,
                    takenAt: status === 'taken' ? new Date() : null,
                    snoozedUntil: snoozedUntil ? new Date(snoozedUntil) : null,
                }
            });
        } else {
            dose = await prisma.dose.update({
                where: { reminderId_date: { reminderId: id, date: today } },
                data: {
                    status,
                    takenAt: status === 'taken' ? new Date() : dose.takenAt,
                    snoozedUntil: snoozedUntil ? new Date(snoozedUntil) : null,
                }
            });
        }

        // Update reminder stats
        const reminderStats = await prisma.dose.groupBy({
            by: ['status'],
            where: { reminderId: id },
            _count: true
        });

        let completedCount = 0, missedCount = 0;
        reminderStats.forEach(stat => {
            if (stat.status === 'taken') completedCount = stat._count;
            else if (stat.status === 'skipped') missedCount = stat._count;
        });

        await prisma.reminder.update({
            where: { id },
            data: {
                completedCount,
                missedCount,
                lastTakenAt: status === 'taken' ? new Date() : reminder.lastTakenAt
            }
        });

        res.json(dose);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log dose' });
    }
});

// Get reminder summary and stats
router.get('/summary/adherence', authMiddleware, async (req, res) => {
    try {
        const reminders = await prisma.reminder.findMany({
            where: { userId: req.user.userId },
            include: { doses: true }
        });

        const stats = {
            totalReminders: reminders.length,
            totalDoses: 0,
            takenDoses: 0,
            skippedDoses: 0,
            adherencePercentage: 0,
            longestStreak: 0,
            nextReminder: null
        };

        let maxStreak = 0;
        let currentStreak = 0;

        reminders.forEach(reminder => {
            reminder.doses.forEach(dose => {
                stats.totalDoses++;
                if (dose.status === 'taken') {
                    stats.takenDoses++;
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            });
        });

        stats.skippedDoses = stats.totalDoses - stats.takenDoses;
        stats.adherencePercentage = stats.totalDoses > 0 ? Math.round((stats.takenDoses / stats.totalDoses) * 100) : 0;
        stats.longestStreak = maxStreak;

        // Find next reminder
        const now = new Date();
        const nextReminder = reminders
            .filter(r => r.nextOccurrence && new Date(r.nextOccurrence) > now)
            .sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence))[0];

        stats.nextReminder = nextReminder ? {
            id: nextReminder.id,
            title: nextReminder.title,
            time: nextReminder.time,
            nextOccurrence: nextReminder.nextOccurrence
        } : null;

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

module.exports = router;
