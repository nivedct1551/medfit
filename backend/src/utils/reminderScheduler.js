const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const scheduledJobs = new Map();

const getTodayString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

const getTimeInMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const getCurrentTimeInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const isReminderActiveToday = (reminder) => {
    if (reminder.repeatType === 'none') return false;
    if (reminder.repeatType === 'daily') return true;
    if (reminder.repeatType === 'specific-days') {
        const repeatDays = reminder.repeatDays ? JSON.parse(reminder.repeatDays) : [];
        const today = new Date().getDay();
        return repeatDays.includes(today);
    }
    return false;
};

const checkAndTriggerReminders = async () => {
    try {
        const currentTime = getCurrentTimeInMinutes();
        const today = getTodayString();

        const reminders = await prisma.reminder.findMany({
            include: {
                doses: {
                    where: { date: today }
                }
            }
        });

        for (const reminder of reminders) {
            if (!isReminderActiveToday(reminder)) continue;

            const reminderTime = getTimeInMinutes(reminder.time);
            // Trigger reminder within a 1-minute window
            if (Math.abs(currentTime - reminderTime) < 1) {
                const todayDose = reminder.doses[0];

                // Only send notification if no dose logged yet
                if (!todayDose || todayDose.status === 'pending') {
                    // Create or update dose record
                    if (!todayDose) {
                        await prisma.dose.create({
                            data: {
                                reminderId: reminder.id,
                                date: today,
                                status: 'pending'
                            }
                        });
                    }

                    // Log reminder triggered (for debugging/analytics)
                    console.log(`[REMINDER] ${reminder.title} @ ${reminder.time} for user ${reminder.userId}`);
                    
                    // In a real app, you'd send a push notification here
                    // For now, we're relying on frontend polling and the dose records
                }
            }
        }
    } catch (error) {
        console.error('[SCHEDULER ERROR]', error);
    }
};

const initializeScheduler = () => {
    // Run every minute to check for due reminders
    const job = cron.schedule('* * * * *', checkAndTriggerReminders, {
        scheduled: true
    });

    console.log('[SCHEDULER] Reminder scheduler initialized');
    return job;
};

const stopScheduler = () => {
    if (scheduledJobs.size > 0) {
        scheduledJobs.forEach((job) => job.stop());
        scheduledJobs.clear();
        console.log('[SCHEDULER] All scheduled jobs stopped');
    }
};

module.exports = {
    initializeScheduler,
    stopScheduler,
    checkAndTriggerReminders
};
