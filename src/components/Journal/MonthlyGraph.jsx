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

// Emoji Map for Tooltip
const EMOJI_MAP = {
    1: '😭 (Very Sad)',
    2: '😞 (Sad)',
    3: '😐 (Neutral)',
    4: '🙂 (Happy)',
    5: '🤩 (Very Happy)',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '10px',
                borderRadius: '8px',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Day {label}</p>
                <p style={{ margin: '5px 0 0 0', color: 'var(--primary)' }}>
                    Mood: {EMOJI_MAP[value] || 'Unknown'}
                </p>
            </div>
        );
    }
    return null;
};

export default function MonthlyGraph({ entries, daysInMonth, currentYear, currentMonth }) {
    // Transform entries into an array for Recharts
    const data = useMemo(() => {
        const chartData = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const entry = entries[dateStr];
            chartData.push({
                day: i,
                mood: entry ? entry.emoji.id : null // 1 to 5
            });
        }
        return chartData;
    }, [entries, daysInMonth, currentYear, currentMonth]);

    return (
        <div style={{ width: '100%', height: 300, marginTop: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>Monthly Mood Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="day"
                        stroke="var(--text-muted)"
                        tick={{ fill: 'var(--text-muted)' }}
                    />
                    <YAxis
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tickFormatter={(val) => ['😭', '😞', '😐', '🙂', '🤩'][val - 1]}
                        stroke="var(--text-muted)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'var(--accent)' }}
                        connectNulls={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
