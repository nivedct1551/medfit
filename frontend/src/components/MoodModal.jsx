import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const moodOptions = [
    { level: 1, emoji: '😢', label: 'Very Sad' },
    { level: 2, emoji: '🙁', label: 'Sad' },
    { level: 3, emoji: '😐', label: 'Neutral' },
    { level: 4, emoji: '🙂', label: 'Happy' },
    { level: 5, emoji: '😁', label: 'Very Happy' },
];

export default function MoodModal({ date, existingEntry, onClose, onSave }) {
    const [moodLevel, setMoodLevel] = useState(3);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (existingEntry) {
            setMoodLevel(existingEntry.moodLevel);
            setNote(existingEntry.note || '');
        }
    }, [existingEntry]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ moodLevel, note });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">How was your day?</h3>
                        <p className="text-sm font-medium text-slate-500">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-4 text-center tracking-wide uppercase">Select Mood</label>
                        <div className="flex justify-between items-center px-2">
                            {moodOptions.map(option => (
                                <button
                                    type="button"
                                    key={option.level}
                                    onClick={() => setMoodLevel(option.level)}
                                    className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-full text-2xl md:text-3xl flex items-center justify-center
                    transition-all duration-300
                    ${moodLevel === option.level
                                            ? 'bg-indigo-100 scale-125 shadow-lg ring-4 ring-indigo-50'
                                            : 'hover:bg-slate-50 hover:scale-110 opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}
                  `}
                                    title={option.label}
                                >
                                    {option.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">Private Diary Note (Optional)</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none bg-slate-50 focus:bg-white min-h-[120px]"
                            placeholder="What made you feel this way?"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95"
                        >
                            {existingEntry ? 'Update Entry' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
