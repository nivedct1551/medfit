const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's reminders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reminders = await prisma.reminder.findMany({
            where: { userId: req.user.userId },
            orderBy: { time: 'asc' },
        });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// Create new reminder
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, category, time, repeatDaily } = req.body;

        const reminder = await prisma.reminder.create({
            data: {
                userId: req.user.userId,
                title,
                category,
                time,
                repeatDaily: repeatDaily || false,
            },
        });

        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create reminder' });
    }
});

// Delete reminder
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.reminder.delete({
            where: { id: req.params.id },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});

// Update standard status (completed/missed)
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body; // 'complete', 'snooze', 'skip'
        const { id } = req.params;

        const reminder = await prisma.reminder.findUnique({ where: { id } });
        if (!reminder) return res.status(404).json({ error: 'Not found' });

        let updateData = {};
        if (status === 'complete') {
            updateData.completedCount = reminder.completedCount + 1;
        } else if (status === 'skip' || status === 'missed') {
            updateData.missedCount = reminder.missedCount + 1;
        }
        // For snooze, no DB update required immediately unless tracking snooze counts

        const updated = await prisma.reminder.update({
            where: { id },
            data: updateData,
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update reminder status' });
    }
});

module.exports = router;
