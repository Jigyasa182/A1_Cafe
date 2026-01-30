import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_URL = 'http://a1-cafe-backend-07w6.onrender.com';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // 'admin' or 'user'
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null); // Made token a state variable

    // Check if user is already logged in (from localStorage)
    useEffect(() => {
        const storedAuth = localStorage.getItem('authData');
        const storedToken = localStorage.getItem('token');

        if (storedAuth && storedToken) {
            const auth = JSON.parse(storedAuth);
            setIsAuthenticated(true);
            setUserRole(auth.role);
            setUserData(auth.user);
            setToken(storedToken); // Set token state
        }
        setLoading(false);
    }, []);

    const login = async (name, password) => {
        try {
            const response = await fetch(`${API_URL}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password })
            });

            const data = await response.json();

            if (data.success) {
                const authData = {
                    token: data.token,
                    role: data.user.role,
                    user: {
                        _id: data.user._id,
                        username: data.user.name,
                        email: data.user.email,
                        name: data.user.name
                    }
                };
                localStorage.setItem('authData', JSON.stringify(authData));
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
                setUserRole(data.user.role);
                setUserData(authData.user);
                setToken(data.token); // Update token state

                // Dispatch custom event to notify other contexts
                window.dispatchEvent(new CustomEvent('tokenUpdated', { detail: data.token }));
                console.log("🔔 Token updated event dispatched");

                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please check if backend is running.' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                const authData = {
                    token: data.token,
                    role: data.user.role,
                    user: {
                        _id: data.user._id,
                        username: data.user.name,
                        email: data.user.email,
                        name: data.user.name
                    }
                };
                localStorage.setItem('authData', JSON.stringify(authData));
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
                setUserRole(data.user.role);
                setUserData(authData.user);
                setToken(data.token); // Update token state

                // Dispatch custom event to notify other contexts
                window.dispatchEvent(new CustomEvent('tokenUpdated', { detail: data.token }));
                console.log("🔔 Token updated event dispatched (signup)");

                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Network error. Please check if backend is running.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('authData');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
        setUserData(null);
        setToken(null); // Clear token state
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, userData, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

