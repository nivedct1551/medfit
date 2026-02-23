import { useState, useEffect } from 'react';
import { API_URL, getAuthHeaders } from '../services/api';
import { Bell, Plus, CheckCircle, Clock, XCircle, Trash2, Flame } from 'lucide-react';

const CATEGORIES = [
    { id: 'medication', label: 'Medication', icon: '💊', color: 'bg-rose-100 text-rose-700' },
    { id: 'supplement', label: 'Supplement', icon: '💉', color: 'bg-blue-100 text-blue-700' },
    { id: 'appointment', label: 'Appointment', icon: '📅', color: 'bg-purple-100 text-purple-700' },
    { id: 'water', label: 'Hydration', icon: '💧', color: 'bg-cyan-100 text-cyan-700' },
    { id: 'exercise', label: 'Exercise', icon: '🏃', color: 'bg-emerald-100 text-emerald-700' },
];

const REPEAT_OPTIONS = [
    { id: 'none', label: 'One-time' },
    { id: 'daily', label: 'Daily' },
    { id: 'specific-days', label: 'Specific Days' },
];

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [stats, setStats] = useState(null);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('medication');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');
    const [repeatType, setRepeatType] = useState('daily');
    const [repeatDays, setRepeatDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        fetchReminders();
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await fetch(`${API_URL}/reminders`, { headers: getAuthHeaders() });
            if (res.ok) setReminders(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/reminders/summary/adherence`, { headers: getAuthHeaders() });
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/reminders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    category,
                    description,
                    time,
                    repeatType,
                    repeatDays: repeatType === 'specific-days' ? repeatDays : null,
                })
            });
            setShowForm(false);
            setTitle('');
            setDescription('');
            setTime('');
            setRepeatType('daily');
            setRepeatDays([1, 2, 3, 4, 5]);
            fetchReminders();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this reminder?')) {
            try {
                await fetch(`${API_URL}/reminders/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                });
                fetchReminders();
            } catch (e) { console.error(e); }
        }
    };

    const handleLogDose = async (id, status) => {
        try {
            await fetch(`${API_URL}/reminders/${id}/log-dose`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            fetchReminders();
            fetchStats();
        } catch (e) { console.error(e); }
    };

    const toggleRepeatDay = (dayIndex) => {
        if (repeatDays.includes(dayIndex)) {
            setRepeatDays(repeatDays.filter(d => d !== dayIndex));
        } else {
            setRepeatDays([...repeatDays, dayIndex].sort());
        }
    };

    const getCategoryIcon = (cat) => {
        return CATEGORIES.find(c => c.id === cat);
    };

    return (
        <div className="py-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="flex justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Medication & Reminders</h1>
                    <p className="text-slate-500 mt-1">Stay on top of your health routine.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full md:rounded-xl md:px-5 flex items-center gap-2 transition-all shadow-md shrink-0">
                    {showForm ? <XCircle size={20} /> : <Plus size={20} />}
                    <span className="hidden md:inline font-bold text-sm">{showForm ? 'Cancel' : 'Add Reminder'}</span>
                </button>
            </header>

            {stats && (
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-xs font-bold uppercase">Adherence</p>
                        <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.adherencePercentage}%</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.takenDoses} of {stats.totalDoses} doses</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-xs font-bold uppercase">Streak</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-1 flex items-center gap-1">{stats.longestStreak} <Flame size={20} /></p>
                        <p className="text-xs text-slate-400 mt-1">Days in a row</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-xs font-bold uppercase">Total Reminders</p>
                        <p className="text-3xl font-bold text-slate-700 mt-1">{stats.totalReminders}</p>
                        <p className="text-xs text-slate-400 mt-1">Active & scheduled</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-xs font-bold uppercase">Next Reminder</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{stats.nextReminder ? stats.nextReminder.title : 'None'}</p>
                        <p className="text-xs text-slate-400 mt-1">{stats.nextReminder ? stats.nextReminder.time : '—'}</p>
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-up">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Take Vitamin D" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                                {CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description (optional)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Additional notes..." rows="2" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Time *</label>
                            <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Repeat</label>
                            <select value={repeatType} onChange={e => setRepeatType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                                {REPEAT_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {repeatType === 'specific-days' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Select Days</label>
                                <div className="grid grid-cols-7 gap-2">
                                    {DAYS.map((day, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleRepeatDay(i)}
                                            className={`py-2 rounded-lg text-sm font-bold transition ${
                                                repeatDays.includes(i)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 transition">Create Reminder</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {reminders.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium pb-2">No reminders yet.</p>
                        <button onClick={() => setShowForm(true)} className="text-indigo-600 font-bold hover:underline">Create your first reminder</button>
                    </div>
                ) : (
                    reminders.map(r => {
                        const cat = getCategoryIcon(r.category);
                        const todayDose = r.doses?.[0];
                        return (
                            <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-indigo-200">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat?.color || 'bg-slate-100'}`}>
                                        {cat?.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 text-lg">{r.title}</h3>
                                        {r.description && <p className="text-sm text-slate-600 mt-1">{r.description}</p>}
                                        <div className="flex items-center gap-3 mt-2 text-sm font-medium flex-wrap">
                                            <span className="flex items-center gap-1 text-indigo-600"><Clock size={14} /> {r.time}</span>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                                                {r.repeatType === 'daily' ? 'Daily' : r.repeatType === 'none' ? 'One-time' : `${r.doses?.length || 0} doses`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-0 pt-4 md:pt-0 border-slate-50 w-full md:w-auto">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleLogDose(r.id, 'taken')} className={`p-2 rounded-lg transition ${todayDose?.status === 'taken' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`} title="Mark Taken"><CheckCircle size={20} /></button>
                                        <button onClick={() => handleLogDose(r.id, 'skipped')} className={`p-2 rounded-lg transition ${todayDose?.status === 'skipped' ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600'}`} title="Skip"><XCircle size={20} /></button>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 hidden md:block mx-1"></div>
                                    <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-500 p-2 transition"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
