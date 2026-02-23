import React, { useState } from 'react';
import './Journal.css';

const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

export default function Calendar({ entries, onDateSelected }) {
    const [currentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <h3>{monthName} {year}</h3>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="day-header">{day}</div>
                ))}

                {days.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="calendar-day empty" />;

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const entry = entries[dateStr];

                    return (
                        <div
                            key={day}
                            className="calendar-day"
                            onClick={() => onDateSelected(dateStr, day)}
                        >
                            <span className="date-number">{day}</span>
                            {entry && entry.emoji && (
                                <span className="date-emoji">{entry.emoji}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
