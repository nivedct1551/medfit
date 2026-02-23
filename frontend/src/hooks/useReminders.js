import { useEffect, useState } from 'react';

export function useReminders(reminders) {
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        // Request permission once
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            reminders.forEach(reminder => {
                if (reminder.time === currentTime) {
                    // Trigger Browser Notification
                    if (Notification.permission === 'granted') {
                        new Notification(reminder.title, {
                            body: `Time for: ${reminder.category}`,
                            icon: '/vite.svg'
                        });
                    }

                    // Trigger local app state for sleep mode grayscale
                    if (reminder.category === 'sleep') {
                        setActiveCategory('sleep');
                        // Dispatch custom event for App.jsx to pick up
                        window.dispatchEvent(new CustomEvent('sleep-mode', { detail: { active: true } }));
                    }
                }
            });
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [reminders]);

    return { activeCategory, setActiveCategory };
}
