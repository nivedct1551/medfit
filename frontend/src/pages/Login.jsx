import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';
import { Activity } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            login(data.user, data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center -mt-8">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-50 p-3 rounded-full mb-4">
                        <Activity className="text-indigo-600 w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">CircleCare</h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Your lightweight social accountability hub</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50"
                            placeholder="Choose a username"
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-indigo-200"
                    >
                        {loading ? 'Joining...' : 'Join Now'}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-400 font-medium">
                    No password needed. Just pick a username to get started.
                </p>
            </div>
        </div>
    );
}
