import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isSignup) {
            // Signup validation
            if (!name.trim() || !email.trim() || !password.trim()) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setLoading(false);
                return;
            }

            const result = await signup(name, email, password);
            if (!result.success) {
                setError(result.message || 'Signup failed');
            }
        } else {
            // Login validation
            if (!name.trim() || !password.trim()) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }

            const result = await login(name, password);
            if (!result.success) {
                setError(result.message || 'Login failed');
            }
        }

        setLoading(false);
    };

    const handleToggle = () => {
        setIsSignup(!isSignup);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>A1 Cafe</h1>
                        <p className="tagline">Your Favorite Place for Delicious Food</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <h2 className="auth-title">
                            {isSignup ? 'Create Account' : 'Welcome Back'}
                        </h2>

                        <div className="form-group">
                            <label htmlFor="name">Username</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        {isSignup && (
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder={isSignup ? "Enter a strong password (min 8 characters)" : "Enter your password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {isSignup ? 'Already have an account?' : 'Don\'t have an account?'}
                            <button
                                type="button"
                                className="toggle-auth"
                                onClick={handleToggle}
                                disabled={loading}
                            >
                                {isSignup ? 'Login' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

