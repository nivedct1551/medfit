const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { initializeScheduler } = require('./utils/reminderScheduler');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CircleCare Backend MVP running!' });
});

// Setup auth routes
app.use('/api/auth', require('./routes/auth'));

// Setup mood tracking routes
app.use('/api/mood', require('./routes/mood'));

// Setup group routes
app.use('/api/groups', require('./routes/groups'));

// Setup reminder routes
app.use('/api/reminders', require('./routes/reminders'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Initialize reminder scheduler
    initializeScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
