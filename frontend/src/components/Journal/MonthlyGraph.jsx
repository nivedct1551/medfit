import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const EMOJI_MAP = {
    1: '😭 (Very Sad)',
    2: '😞 (Sad)',
    3: '😐 (Neutral)',
    4: '🙂 (Happy)',
    5: '🤩 (Very Happy)',
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div style={{
                background: 'rgb(30, 41, 59)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px',
                color: 'rgb(248, 250, 252)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Day {payload[0].payload.day}</p>
                <p style={{ margin: '5px 0 0 0', color: '#3b82f6' }}>
                    Mood: {EMOJI_MAP[value] || 'No entry'}
                </p>
            </div>
        );
    }
    return null;
};

export default function MonthlyGraph({ entries, daysInMonth, currentYear, currentMonth }) {
    const data = useMemo(() => {
        const chartData = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const entry = entries[dateStr];
            const moodLevel = entry?.moodLevel || null;
            chartData.push({
                day: i,
                mood: moodLevel
            });
        }
        return chartData;
    }, [entries, daysInMonth, currentYear, currentMonth]);

    return (
        <div style={{ width: '100%', height: 300, marginTop: '1.5rem', background: 'rgb(30, 41, 59)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'rgb(248, 250, 252)', fontSize: '1.1rem' }}>Monthly Mood Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis
                        dataKey="day"
                        stroke="rgb(148, 163, 184)"
                        tick={{ fill: 'rgb(148, 163, 184)' }}
                    />
                    <YAxis
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tickFormatter={(val) => ['😭', '😞', '😐', '🙂', '🤩'][val - 1]}
                        stroke="rgb(148, 163, 184)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                        connectNulls={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
