import { useState, useEffect } from 'react';
import { API_URL, getAuthHeaders } from '../services/api';
import { useReminders } from '../hooks/useReminders';
import { Bell, Plus, CheckCircle, Clock, XCircle, Trash2, Moon } from 'lucide-react';

const CATEGORIES = [
    { id: 'medicine', label: 'Medicine', icon: '💊', color: 'bg-rose-100 text-rose-700' },
    { id: 'water', label: 'Hydration', icon: '💧', color: 'bg-blue-100 text-blue-700' },
    { id: 'exercise', label: 'Exercise', icon: '🏃', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'sleep', label: 'Sleep', icon: '🌙', color: 'bg-indigo-100 text-indigo-700' },
];

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('medicine');
    const [time, setTime] = useState('');
    const [repeatDaily, setRepeatDaily] = useState(true);

    // Hook handles active checking in the background
    const { activeCategory, setActiveCategory } = useReminders(reminders);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await fetch(`${API_URL}/reminders`, { headers: getAuthHeaders() });
            if (res.ok) setReminders(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/reminders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title, category, time, repeatDaily })
            });
            setShowForm(false);
            setTitle('');
            setTime('');
            fetchReminders();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`${API_URL}/reminders/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            fetchReminders();
        } catch (e) { console.error(e); }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await fetch(`${API_URL}/reminders/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            fetchReminders();
        } catch (e) { console.error(e); }
    };

    const clearSleepMode = () => {
        setActiveCategory(null);
        window.dispatchEvent(new CustomEvent('sleep-mode', { detail: { active: false } }));
    };

    return (
        <div className="py-6 max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">

            {activeCategory === 'sleep' && (
                <div className="bg-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-down border border-slate-700">
                    <div className="flex items-center gap-4">
                        <Moon className="w-10 h-10 text-indigo-300 animate-pulse" />
                        <div>
                            <h3 className="font-bold text-lg">Wind Down Time</h3>
                            <p className="text-slate-400 text-sm">Your sleep reminder was triggered. Screen dimmed.</p>
                        </div>
                    </div>
                    <button onClick={clearSleepMode} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-xl font-bold transition">
                        Dismiss Sleep Mode
                    </button>
                </div>
            )}

            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Reminders</h1>
                    <p className="text-slate-500 mt-1">Manage your health and routine.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full md:rounded-xl md:px-5 flex items-center gap-2 transition-all shadow-md">
                    {showForm ? <XCircle size={20} /> : <Plus size={20} />}
                    <span className="hidden md:inline font-bold">{showForm ? 'Cancel' : 'New Reminder'}</span>
                </button>
            </header>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-up">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Take Vitamins" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(c => (
                                    <button type="button" key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${category === c.id ? 'border-indigo-500 ring-1 ring-indigo-500 ' + c.color : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                        <span>{c.icon}</span> {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                            <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-xl w-full bg-slate-50">
                                <input type="checkbox" checked={repeatDaily} onChange={e => setRepeatDaily(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="font-bold text-slate-700">Repeat Daily</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 transition">Save Reminder</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {reminders.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium pb-2">No active reminders.</p>
                        <button onClick={() => setShowForm(true)} className="text-indigo-600 font-bold hover:underline">Create your first</button>
                    </div>
                ) : (
                    reminders.map(r => {
                        const cat = CATEGORIES.find(c => c.id === r.category);
                        return (
                            <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-indigo-200">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${cat.color}`}>
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{r.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                                            <span className="flex items-center gap-1 text-indigo-600"><Clock size={14} /> {r.time}</span>
                                            {r.repeatDaily && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Daily</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-0 pt-4 md:pt-0 border-slate-50">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStatusUpdate(r.id, 'complete')} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-2 rounded-lg transition" title="Mark Done"><CheckCircle size={20} /></button>
                                        <button onClick={() => handleStatusUpdate(r.id, 'snooze')} className="bg-amber-50 text-amber-600 hover:bg-amber-100 p-2 rounded-lg transition" title="Snooze"><Clock size={20} /></button>
                                        <button onClick={() => handleStatusUpdate(r.id, 'skip')} className="bg-slate-50 text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition" title="Skip"><XCircle size={20} /></button>
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
