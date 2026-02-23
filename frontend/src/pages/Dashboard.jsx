import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../services/api';
import Calendar from '../components/Journal/Calendar';
import EmojiSelector from '../components/Journal/EmojiSelector';
import MonthlyGraph from '../components/Journal/MonthlyGraph';
import '../components/Journal/Journal.css';
import { Sparkles } from 'lucide-react';

const EMOJI_STATES = [
    { id: 1, emoji: '😭', label: 'Very Sad', color: '#ef4444' },
    { id: 2, emoji: '😞', label: 'Sad', color: '#f97316' },
    { id: 3, emoji: '😐', label: 'Neutral', color: '#eab308' },
    { id: 4, emoji: '🙂', label: 'Happy', color: '#84cc16' },
    { id: 5, emoji: '🤩', label: 'Very Happy', color: '#22c55e' }
];

export default function Dashboard() {
    const { user } = useAuth();
    const [entries, setEntries] = useState({});
    const [insight, setInsight] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMoodId, setSelectedMoodId] = useState(null);
    const [journalNote, setJournalNote] = useState('');

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const entriesRes = await fetch(`${API_URL}/mood`, { headers: getAuthHeaders() });
            if (entriesRes.ok) {
                const data = await entriesRes.json();
                const entriesMap = {};
                data.forEach(entry => {
                    const emojiObj = EMOJI_STATES.find(e => e.id === entry.moodLevel);
                    entriesMap[entry.date] = {
                        emoji: emojiObj?.emoji || '😐',
                        moodLevel: entry.moodLevel,
                        journalNote: entry.note || ''
                    };
                });
                setEntries(entriesMap);
            }

            const insightRes = await fetch(`${API_URL}/mood/weekly-summary`, { headers: getAuthHeaders() });
            if (insightRes.ok) {
                const data = await insightRes.json();
                setInsight(data.insight);
            }
        } catch (e) { console.error(e); }
    };

    const handleDateSelected = (dateStr, dayNum) => {
        setSelectedDate(dateStr);
        const existing = entries[dateStr];
        if (existing) {
            const moodState = EMOJI_STATES.find(e => e.emoji === existing.emoji);
            setSelectedMoodId(moodState?.id || null);
            setJournalNote(existing.journalNote || '');
        } else {
            setSelectedMoodId(null);
            setJournalNote('');
        }
        setIsModalOpen(true);
    };

    const handleSaveEntry = async () => {
        if (!selectedMoodId) {
            alert("Please select a mood to save your entry.");
            return;
        }

        try {
            await fetch(`${API_URL}/mood`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    date: selectedDate,
                    moodLevel: selectedMoodId,
                    note: journalNote
                })
            });

            const emojiObj = EMOJI_STATES.find(e => e.id === selectedMoodId);
            setEntries(prev => ({
                ...prev,
                [selectedDate]: {
                    emoji: emojiObj.emoji,
                    moodLevel: selectedMoodId,
                    journalNote: journalNote
                }
            }));

            setIsModalOpen(false);
            fetchData();
        } catch (e) {
            console.error('Failed to save mood', e);
            alert('Failed to save entry');
        }
    };

    return (
        <div className="journal-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(30, 41, 59)', marginBottom: '0.5rem' }}>
                    Welcome back, {user?.username || 'Friend'} 👋
                </h1>
                <p style={{ color: 'rgb(100, 116, 139)', fontWeight: '500' }}>
                    Here's your mental health journal and insights.
                </p>
            </header>

            {(Object.values(entries).filter(e => e.moodLevel <= 2).length > 0) && (
                <div style={{
                    background: 'linear-gradient(145deg, rgb(248, 250, 252), white)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid rgb(226, 232, 240)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        background: 'rgb(59, 130, 246, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        color: 'rgb(59, 130, 246)',
                        flexShrink: 0
                    }}>💡</div>
                    <div>
                        <h4 style={{ fontSize: '1rem', color: 'rgb(30, 41, 59)', marginBottom: '0.25rem', fontWeight: '600' }}>
                            Check in on yourself
                        </h4>
                        <p style={{ color: 'rgb(100, 116, 139)', fontSize: '0.95rem', margin: 0 }}>
                            You felt low on {Object.values(entries).filter(e => e.moodLevel <= 2).length} day(s) recently. Remember it's okay to ask for help.
                        </p>
                    </div>
                </div>
            )}

            <Calendar entries={entries} onDateSelected={handleDateSelected} />

            <MonthlyGraph entries={entries} daysInMonth={daysInMonth} currentYear={currentYear} currentMonth={currentMonth} />

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') setIsModalOpen(false);
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Journal - {selectedDate}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            <h4>How was your day?</h4>
                            <EmojiSelector
                                selectedId={selectedMoodId}
                                onSelect={(id) => setSelectedMoodId(id)}
                            />

                            <h4 style={{ marginTop: '1.5rem' }}>Write your thoughts...</h4>
                            <textarea
                                value={journalNote}
                                onChange={(e) => setJournalNote(e.target.value)}
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
