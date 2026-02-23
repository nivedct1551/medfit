import React, { useState } from 'react';
import Journal from './components/Journal';
import Social from './components/Social';
import Reminders from './components/Reminders';
import './index.css';

function App() {
    const [activeTab, setActiveTab] = useState('journal');

    return (
        <div className="app-container">
            <header className="header">
                <h1>MedFit</h1>
                <nav>
                    <button
                        className={`nav-btn ${activeTab === 'journal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('journal')}
                    >
                        Journal
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        Social
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'reminders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reminders')}
                    >
                        Reminders
                    </button>
                </nav>
            </header>
            <main className="content">
                {activeTab === 'journal' && <Journal />}
                {activeTab === 'social' && <Social />}
                {activeTab === 'reminders' && <Reminders />}
            </main>
        </div>
    );
}

export default App;
