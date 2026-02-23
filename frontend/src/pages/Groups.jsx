import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../services/api';
import { Users, Plus, UserPlus, Heart, MessageSquare, Flame } from 'lucide-react';

export default function Groups() {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);

    // Forms
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    // Active Group Data
    const [groupDetails, setGroupDetails] = useState(null);
    const [feed, setFeed] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [postType, setPostType] = useState('text'); // text or fitness

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (activeGroup) {
            fetchGroupDetails(activeGroup.id);
            fetchGroupFeed(activeGroup.id);
        }
    }, [activeGroup]);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${API_URL}/groups`, { headers: getAuthHeaders() });
            if (res.ok) setGroups(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchGroupDetails = async (groupId) => {
        try {
            const res = await fetch(`${API_URL}/groups/${groupId}`, { headers: getAuthHeaders() });
            if (res.ok) setGroupDetails(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchGroupFeed = async (groupId) => {
        try {
            const res = await fetch(`${API_URL}/groups/${groupId}/feed`, { headers: getAuthHeaders() });
            if (res.ok) setFeed(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/groups`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name: newGroupName })
            });
            if (res.ok) {
                setNewGroupName('');
                setShowCreate(false);
                fetchGroups();
            }
        } catch (e) { console.error(e); }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/groups/join`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ inviteCode: joinCode })
            });
            if (res.ok) {
                setJoinCode('');
                setShowJoin(false);
                fetchGroups();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to join');
            }
        } catch (e) { console.error(e); }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() || !activeGroup) return;
        try {
            await fetch(`${API_URL}/groups/${activeGroup.id}/posts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ content: newPost, type: postType })
            });
            setNewPost('');
            fetchGroupFeed(activeGroup.id);
        } catch (e) { console.error(e); }
    };

    const handleLike = async (postId) => {
        try {
            await fetch(`${API_URL}/groups/${activeGroup.id}/posts/${postId}/like`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            fetchGroupFeed(activeGroup.id); // Refresh to get updated likes
        } catch (e) { console.error(e); }
    };

    if (!activeGroup) {
        return (
            <div className="py-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
                <header>
                    <h1 className="text-3xl font-bold text-slate-800">Your Circles</h1>
                    <p className="text-slate-500 mt-1">Join up to 10 friends to share motivation.</p>
                </header>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => { setShowCreate(true); setShowJoin(false); }} className="flex-1 bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group">
                        <div className="bg-indigo-50 p-3 rounded-full group-hover:bg-indigo-100 transition-colors"><Plus className="text-indigo-600" /></div>
                        <span className="font-bold text-slate-700">Create a Circle</span>
                    </button>
                    <button onClick={() => { setShowJoin(true); setShowCreate(false); }} className="flex-1 bg-white border border-slate-200 hover:border-teal-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group">
                        <div className="bg-teal-50 p-3 rounded-full group-hover:bg-teal-100 transition-colors"><UserPlus className="text-teal-600" /></div>
                        <span className="font-bold text-slate-700">Join a Circle</span>
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreateGroup} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-down">
                        <h3 className="font-bold mb-4 text-slate-800">Name your new circle</h3>
                        <div className="flex gap-2">
                            <input type="text" required value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Morning Runners" />
                            <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition">Create</button>
                        </div>
                    </form>
                )}

                {showJoin && (
                    <form onSubmit={handleJoinGroup} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-down">
                        <h3 className="font-bold mb-4 text-slate-800">Enter Invite Code</h3>
                        <div className="flex gap-2">
                            <input type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} className="uppercase flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. A1B2C3" />
                            <button type="submit" className="bg-teal-600 text-white px-6 rounded-xl font-bold hover:bg-teal-700 transition">Join</button>
                        </div>
                    </form>
                )}

                {groups.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Active Circles</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {groups.map(g => (
                                <button key={g.id} onClick={() => setActiveGroup(g)} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all text-left flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                                            {g.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{g.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">Tap to enter dashboard</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Active Group Dashboard
    return (
        <div className="py-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 lg:gap-8 min-h-[85vh] animate-fade-in">
            {/* Sidebar: Group Stats */}
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6 shrink-0">
                <button onClick={() => setActiveGroup(null)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                    &larr; Back to Circles
                </button>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                        {groupDetails?.name?.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{groupDetails?.name}</h2>
                    <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Invite Code:</span>
                        <span className="font-mono font-bold text-slate-700 tracking-wider bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">{groupDetails?.inviteCode}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-indigo-500" /> Members ({groupDetails?.members?.length}/10)
                    </h3>
                    <div className="space-y-4">
                        {groupDetails?.members?.map(m => (
                            <div key={m.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-700">{m.name} {m.id === user?.userId ? '(You)' : ''}</span>
                                <div className="flex gap-3 text-sm">
                                    <span className="flex items-center gap-1 text-slate-600" title="Very Happy Days"><span className="text-lg">😁</span> <span className="font-bold">{m.stats.veryHappyCount}</span></span>
                                    <span className="flex items-center gap-1 text-slate-600" title="Low Mood Days"><span className="text-lg">🙁</span> <span className="font-bold">{m.stats.lowCount}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Column: Feed */}
            <div className="flex-1 space-y-6 flex flex-col h-full">
                {/* Post Form */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none bg-slate-50 focus:bg-white min-h-[100px]"
                            placeholder="Share an update, hit a goal, or ask for support..."
                            value={newPost}
                            onChange={e => setNewPost(e.target.value)}
                            required
                        />
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setPostType('text')} className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${postType === 'text' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    <MessageSquare size={14} /> Update
                                </button>
                                <button type="button" onClick={() => setPostType('fitness')} className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${postType === 'fitness' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    <Flame size={14} /> Fitness Win
                                </button>
                            </div>
                            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md">Post</button>
                        </div>
                    </form>
                </div>

                {/* Feed Stream */}
                <div className="space-y-4 pb-12">
                    {feed.length === 0 ? (
                        <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No posts yet. Be the first to break the ice!</p>
                        </div>
                    ) : (
                        feed.map(post => (
                            <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-slide-up">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${post.type === 'fitness' ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-slate-300 text-slate-700'}`}>
                                        {post.type === 'fitness' ? <Flame size={20} /> : post.user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-slate-800">{post.user.name}</h4>
                                            <span className="text-xs text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className={`text-slate-700 whitespace-pre-wrap ${post.type === 'fitness' ? 'font-medium bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 mt-2' : ''}`}>
                                            {post.content}
                                        </p>
                                        <div className="mt-3 flex items-center gap-4">
                                            <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-rose-500 transition group">
                                                <Heart size={16} className={`group-hover:fill-rose-500 group-hover:text-rose-500 transition-all ${post.likes > 0 ? 'text-rose-400' : ''}`} />
                                                <span className={post.likes > 0 ? 'text-rose-500' : ''}>{post.likes > 0 ? post.likes : 'Like'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
