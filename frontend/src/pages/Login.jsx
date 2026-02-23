import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';
import { Activity } from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const url = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;
        const payload = isLogin ? { email, password } : { email, password, name };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            login(data.user, data.token);
        } catch (err) {
            setError(err.message);
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
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                            <input
                                type="text" required
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="How should we call you?"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-indigo-200"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                    {isLogin ? "New to CircleCare? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
}
