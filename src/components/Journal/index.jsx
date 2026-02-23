import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import EmojiSelector from './EmojiSelector';
import './Journal.css';

const EMOJI_STATES = [
    { id: 1, emoji: '😭', label: 'Very Sad', color: '#ef4444' },
    { id: 2, emoji: '😞', label: 'Sad', color: '#f97316' },
    { id: 3, emoji: '😐', label: 'Neutral', color: '#eab308' },
    { id: 4, emoji: '🙂', label: 'Happy', color: '#84cc16' },
    { id: 5, emoji: '🤩', label: 'Very Happy', color: '#22c55e' }
];

export default function Journal() {
    const [entries, setEntries] = useState({});
    const [activeDate, setActiveDate] = useState(null); // String e.g. "2023-11-05"
    const [activeDay, setActiveDay] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Current modal state
    const [selectedEmojiId, setSelectedEmojiId] = useState(null);
    const [thoughts, setThoughts] = useState('');

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('medfit_journal');
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        if (Object.keys(entries).length > 0) {
            localStorage.setItem('medfit_journal', JSON.stringify(entries));
        }
    }, [entries]);

    const handleDateSelected = (dateStr, dayNum) => {
        setActiveDate(dateStr);
        setActiveDay(dayNum);

        // Load existing entry if any
        const existing = entries[dateStr];
        if (existing) {
            setSelectedEmojiId(existing.emoji.id);
            setThoughts(existing.thoughts || '');
        } else {
            setSelectedEmojiId(null);
            setThoughts('');
        }

        setModalOpen(true);
    };

    const handleSaveEntry = () => {
        if (!selectedEmojiId) {
            alert("Please select an emoji to save your entry.");
            return;
        }

        const emojiObj = EMOJI_STATES.find(e => e.id === selectedEmojiId);

        setEntries(prev => ({
            ...prev,
            [activeDate]: {
                emoji: emojiObj,
                thoughts: thoughts
            }
        }));

        setModalOpen(false);
    };

    // Insights logic: simply count low mood days (ID 1 or 2) in all entries
    // Ideally, this should scan the last 7 days, but for a hackathon keeping it simple
    const lowDays = Object.values(entries).filter(e => e.emoji.id <= 2).length;

    return (
        <div className="journal-container">
            {lowDays > 0 && (
                <div className="insights-widget">
                    <div className="insights-icon">💡</div>
                    <div className="insights-text">
                        <h4>Check in on yourself</h4>
                        <p>You felt low on {lowDays} day{lowDays !== 1 ? 's' : ''} according to your journal. Remember it's okay to ask for help.</p>
                    </div>
                </div>
            )}

            <Calendar entries={entries} onDateSelected={handleDateSelected} />

            {modalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') setModalOpen(false);
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Journal - {activeDay}</h2>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            <h4 style={{ marginBottom: '1rem' }}>How was your day?</h4>
                            <EmojiSelector
                                selectedId={selectedEmojiId}
                                onSelect={(id) => setSelectedEmojiId(id)}
                            />

                            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Write your thoughts...</h4>
                            <textarea
                                value={thoughts}
                                onChange={(e) => setThoughts(e.target.value)}
                                placeholder="Today was..."
                            />

                            <button className="save-btn" onClick={handleSaveEntry}>
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
