import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';

// Pages placeholder
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Reminders from './pages/Reminders';
import { Activity, Calendar, Bell, Users, LogOut } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [sleepMode, setSleepMode] = useState(false);

  // Expose sleep mode toggle for reminders component to call globally
  useEffect(() => {
    const handleSleepModeToggle = (e) => setSleepMode(e.detail.active);
    window.addEventListener('sleep-mode', handleSleepModeToggle);
    return () => window.removeEventListener('sleep-mode', handleSleepModeToggle);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${sleepMode ? 'sleep-mode' : ''}`}>
      <Router>
        {isAuthenticated && (
          <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 md:bottom-auto md:top-0 md:border-t-0 md:border-b flex justify-around md:justify-start px-4 py-3 md:py-4 z-50 shadow-sm">
            <div className="hidden md:flex items-center space-x-2 mr-8">
              <Activity className="text-indigo-600" />
              <span className="font-bold text-xl tracking-tight text-indigo-900">CircleCare</span>
            </div>

            <div className="flex w-full md:w-auto justify-around md:space-x-6 md:flex-grow">
              <Link to="/" className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 text-slate-500 hover:text-indigo-600 transition-colors">
                <Calendar size={20} />
                <span className="text-xs md:text-sm font-medium">Journal</span>
              </Link>
              <Link to="/groups" className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 text-slate-500 hover:text-indigo-600 transition-colors">
                <Users size={20} />
                <span className="text-xs md:text-sm font-medium">Circles</span>
              </Link>
              <Link to="/reminders" className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 text-slate-500 hover:text-indigo-600 transition-colors">
                <Bell size={20} />
                <span className="text-xs md:text-sm font-medium">Reminders</span>
              </Link>
            </div>

            <div className="hidden md:flex md:items-center">
              <button onClick={logout} className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors">
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </nav>
        )}

        <main className={`pb-20 md:pb-8 ${isAuthenticated ? 'md:pt-24 pt-4' : 'pt-0'} px-4 md:px-8 max-w-6xl mx-auto h-full`}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/groups"
              element={<ProtectedRoute><Groups /></ProtectedRoute>}
            />
            <Route
              path="/reminders"
              element={<ProtectedRoute><Reminders /></ProtectedRoute>}
            />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
