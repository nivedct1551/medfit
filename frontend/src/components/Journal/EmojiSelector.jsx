import React from 'react';
import './Journal.css';

const EMOJI_STATES = [
    { id: 1, emoji: '😭', label: 'Very Sad', color: '#ef4444' },
    { id: 2, emoji: '😞', label: 'Sad', color: '#f97316' },
    { id: 3, emoji: '😐', label: 'Neutral', color: '#eab308' },
    { id: 4, emoji: '🙂', label: 'Happy', color: '#84cc16' },
    { id: 5, emoji: '🤩', label: 'Very Happy', color: '#22c55e' }
];

export default function EmojiSelector({ selectedId, onSelect }) {
    return (
        <div className="emoji-selector">
            {EMOJI_STATES.map((state) => (
                <button
                    key={state.id}
                    className={`emoji-btn ${selectedId === state.id ? 'selected' : ''}`}
                    onClick={() => onSelect(state.id)}
                    title={state.label}
                    style={{ '--accent-color': state.color }}
                >
                    {state.emoji}
                </button>
            ))}
        </div>
    );
}
