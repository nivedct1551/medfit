const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validateLogin } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Register/Login User (username only)
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { username } = req.body;

        // Find or create user
        let user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            // Create new user if doesn't exist
            user = await prisma.user.create({
                data: { username },
            });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { userId: user.id, username: user.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
