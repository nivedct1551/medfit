import React, { useState, useEffect } from 'react';
import './Reminders.css';

const INITIAL_REMINDERS = [
    { id: 1, type: 'Medicine', text: 'Take Vitamin D', time: '08:00 AM', completed: false, snoozed: false },
    { id: 2, type: 'Water', text: 'Drink 500ml of water', time: '10:00 AM', completed: true, snoozed: false },
    { id: 3, type: 'Exercise', text: 'Quick stretch break', time: '02:00 PM', completed: false, snoozed: false },
    { id: 4, type: 'Sleep', text: 'Wind down for bed', time: '10:00 PM', completed: false, snoozed: false }
];

export default function Reminders() {
    const [reminders, setReminders] = useState(INITIAL_REMINDERS);
    const [showForm, setShowForm] = useState(false);

    const [newType, setNewType] = useState('Medicine');
    const [newText, setNewText] = useState('');
    const [newTime, setNewTime] = useState('');

    // Effect to handle sleep snooze penalty (Black & White screen)
    useEffect(() => {
        const hasSnoozedSleep = reminders.some(r => r.type === 'Sleep' && r.snoozed);
        if (hasSnoozedSleep) {
            document.body.style.filter = 'grayscale(100%)';
        } else {
            document.body.style.filter = 'none';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.filter = 'none';
        };
    }, [reminders]);

    const toggleComplete = (id) => {
        setReminders(prev => prev.map(r => {
            if (r.id === id) {
                // If completing a snoozed sleep reminder, remove the penalty!
                return { ...r, completed: !r.completed, snoozed: false };
            }
            return r;
        }));
    };

    const handleSnooze = (id) => {
        setReminders(prev => prev.map(r => {
            if (r.id === id) {
                return { ...r, snoozed: true };
            }
            return r;
        }));
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        if (!newText || !newTime) return;

        // Format simple time string
        const [hours, minutes] = newTime.split(':');
        const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const hr = parseInt(hours) % 12 || 12;
        const timeStr = `${hr.toString().padStart(2, '0')}:${minutes} ${period}`;

        const newReminder = {
            id: Date.now(),
            type: newType,
            text: newText,
            time: timeStr,
            completed: false,
            snoozed: false
        };

        setReminders(prev => [...prev, newReminder]);
        setShowForm(false);
        setNewText('');
        setNewTime('');
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Medicine': return '💊';
            case 'Water': return '💧';
            case 'Exercise': return '🏃';
            case 'Sleep': return '😴';
            default: return '⏰';
        }
    };

    return (
        <div className="reminders-container">
            <div className="reminders-header">
                <h2>Daily Habits & Reminders</h2>
                <button className="add-btn" onClick={() => setShowForm(true)}>+ Add New</button>
            </div>

            {showForm && (
                <form className="reminder-form" onSubmit={handleAddReminder}>
                    <div className="form-group">
                        <label>Type</label>
                        <select value={newType} onChange={e => setNewType(e.target.value)}>
                            <option value="Medicine">Medicine</option>
                            <option value="Water">Water</option>
                            <option value="Exercise">Exercise</option>
                            <option value="Sleep">Sleep</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Reminder text</label>
                        <input
                            type="text"
                            placeholder="e.g. Take 8PM tablet"
                            value={newText}
                            onChange={e => setNewText(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Time</label>
                        <input
                            type="time"
                            value={newTime}
                            onChange={e => setNewTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="save-btn" style={{ width: 'auto' }}>Save</button>
                    </div>
                </form>
            )}

            <div className="reminders-list">
                {reminders.map(reminder => (
                    <div key={reminder.id} className={`reminder-card ${reminder.completed ? 'completed' : ''} ${reminder.snoozed ? 'snoozed' : ''}`}>
                        <div className="reminder-icon">
                            {getTypeIcon(reminder.type)}
                        </div>
                        <div className="reminder-content">
                            <h4>{reminder.text}</h4>
                            <span className="reminder-time">{reminder.time} - {reminder.type}</span>
                            {reminder.snoozed && reminder.type === 'Sleep' && (
                                <div className="penalty-text">⚠️ Screen color penalty active due to snooze!</div>
                            )}
                        </div>
                        <div className="reminder-actions">
                            {!reminder.completed && (
                                <button className="snooze-btn" onClick={() => handleSnooze(reminder.id)}>Snooze</button>
                            )}
                            <button
                                className={`check-btn ${reminder.completed ? 'checked' : ''}`}
                                onClick={() => toggleComplete(reminder.id)}
                            >
                                {reminder.completed ? '✓ Done' : 'Complete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
