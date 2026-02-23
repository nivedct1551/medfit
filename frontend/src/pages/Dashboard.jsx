import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../services/api';
import Calendar from '../components/Calendar';
import MoodModal from '../components/MoodModal';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [insight, setInsight] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const entriesRes = await fetch(`${API_URL}/mood`, { headers: getAuthHeaders() });
            if (entriesRes.ok) {
                const data = await entriesRes.json();
                setEntries(data);
            }

            const insightRes = await fetch(`${API_URL}/mood/weekly-summary`, { headers: getAuthHeaders() });
            if (insightRes.ok) {
                const data = await insightRes.json();
                setInsight(data.insight);
            }
        } catch (e) { console.error(e); }
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleSaveEntry = async (moodData) => {
        try {
            await fetch(`${API_URL}/mood`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    date: selectedDate,
                    ...moodData
                })
            });
            setIsModalOpen(false);
            fetchData(); // Refresh UI
        } catch (e) { console.error('Failed to save mood', e); }
    };

    return (
        <div className="py-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.name} 👋</h1>
                    <p className="text-slate-500 mt-1 font-medium">Here's your mood journal and insights.</p>
                </div>

                {insight && (
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 w-full md:max-w-md shadow-sm">
                        <Sparkles className="text-indigo-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-1">Weekly Insight</h3>
                            <p className="text-indigo-900 text-sm font-medium">{insight}</p>
                        </div>
                    </div>
                )}
            </header>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Your Month</h2>
                <Calendar entries={entries} onDateClick={handleDateClick} />
            </section>

            {isModalOpen && (
                <MoodModal
                    date={selectedDate}
                    existingEntry={entries.find(e => e.date === selectedDate)}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveEntry}
                />
            )}
        </div>
    );
}
