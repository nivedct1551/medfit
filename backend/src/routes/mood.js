const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const { calculateWeeklyInsight } = require('../utils/moodInsights');

const router = express.Router();
const prisma = new PrismaClient();

// Get mood entries for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const entries = await prisma.moodEntry.findMany({
            where: { userId: req.user.userId },
            orderBy: { date: 'asc' },
        });
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mood entries' });
    }
});

// Create or update a mood entry
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { date, moodLevel, note } = req.body; // date expected 'YYYY-MM-DD'

        // Upsert entry ensures max 1 entry per day
        const entry = await prisma.moodEntry.upsert({
            where: {
                userId_date: {
                    userId: req.user.userId,
                    date,
                },
            },
            update: {
                moodLevel,
                note,
            },
            create: {
                userId: req.user.userId,
                date,
                moodLevel,
                note,
            },
        });

        res.json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save mood entry' });
    }
});

// Get Weekly Insight
router.get('/weekly-summary', authMiddleware, async (req, res) => {
    try {
        // A proper weekly summary would filter by the last 7 days.
        // For MVP hackathon speed, we'll grab the latest 7 entries.
        const entries = await prisma.moodEntry.findMany({
            where: { userId: req.user.userId },
            orderBy: { date: 'desc' },
            take: 7,
        });

        const insight = calculateWeeklyInsight(entries);
        res.json({ insight });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate weekly insight' });
    }
});

module.exports = router;
