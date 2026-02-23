import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // Normalize user data to always have userId
                if (userData && !userData.userId && userData.id) {
                    userData.userId = userData.id;
                }
                setUser(userData);
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Normalize user data to always have userId
        const normalizedUser = {
            ...userData,
            userId: userData.userId || userData.id,
        };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading CircleCare...</div>;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
