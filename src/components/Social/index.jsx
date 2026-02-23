import React, { useState } from 'react';
import './Social.css';

// Mock Data for hackathon
const MOCK_POSTS = [
    {
        id: 1,
        author: 'Alex (Friend)',
        isFriend: true,
        time: '2 hours ago',
        content: 'Just finished a 5k run! Feeling amazing. Getting closer to my monthly goal.',
        steps: '8,432',
        streak: '12 days',
        moodSummary: 'Mostly Happy - Keep it up!'
    },
    {
        id: 2,
        author: 'Anonymous',
        isFriend: false,
        time: '4 hours ago',
        content: 'Had a really tough day today. Feeling overwhelmed with work and life. Anyone else struggle with this?',
        steps: '2,100',
        streak: '0 days',
        moodSummary: 'Low - Needs Support'
    },
    {
        id: 3,
        author: 'Sam (Friend)',
        isFriend: true,
        time: 'Yesterday',
        content: 'Hit the gym for weights. Feeling sore but proud! Thanks to Alex for the motivation.',
        steps: '10,200',
        streak: '5 days',
        moodSummary: 'Neutral - Steady progress'
    },
    {
        id: 4,
        author: 'Anonymous',
        isFriend: false,
        time: 'Yesterday',
        content: 'Finally started meditating again. 10 minutes a day makes such a big difference.',
        steps: '4,500',
        streak: '2 days',
        moodSummary: 'Happy - Improving!'
    }
];

export default function Social() {
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'friends'
    const [selectedFriend, setSelectedFriend] = useState(null);

    const postsToShow = activeTab === 'friends'
        ? MOCK_POSTS.filter(p => p.isFriend)
        : MOCK_POSTS;

    return (
        <div className="social-container">
            <div className="social-tabs">
                <button
                    className={`social-tab-btn ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    🌎 Global Support
                </button>
                <button
                    className={`social-tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    👥 Friends Circle
                </button>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {activeTab === 'global' ? 'Connect with strangers facing similar journeys.' : 'See how your friends are doing and motivate them!'}
            </div>

            {postsToShow.map(post => (
                <div
                    key={post.id}
                    className="post-card"
                    onClick={() => {
                        if (post.isFriend) setSelectedFriend(post);
                    }}
                >
                    <div className="post-header">
                        <div className={`avatar ${post.isFriend ? 'friend' : ''}`}>
                            {post.author.charAt(0)}
                        </div>
                        <div className="post-meta">
                            <span className="author-name">{post.author}</span>
                            <span className="post-time">{post.time}</span>
                        </div>
                    </div>
                    <div className="post-content">
                        {post.content}
                    </div>
                    <div className="post-metrics">
                        <div className="metric">
                            <span className="metric-icon">👟</span> {post.steps} steps
                        </div>
                        <div className="metric">
                            <span className="metric-icon">🔥</span> {post.streak} streak
                        </div>
                    </div>
                </div>
            ))}

            {/* Friend Dashboard Modal */}
            {selectedFriend && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') setSelectedFriend(null);
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedFriend.author.replace(' (Friend)', '')}'s Dashboard</h2>
                            <button className="close-btn" onClick={() => setSelectedFriend(null)}>&times;</button>
                        </div>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <div className="stat-value">{selectedFriend.streak}</div>
                                <div className="stat-label">Current Streak</div>
                            </div>
                            <div className="dashboard-card">
                                <div className="stat-value">{selectedFriend.steps}</div>
                                <div className="stat-label">Daily Steps</div>
                            </div>
                        </div>

                        <div className="mood-overview">
                            <h4>Monthly Mood Overview</h4>
                            <p>{selectedFriend.moodSummary}</p>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <button className="save-btn">Send Encouragement 👏</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
