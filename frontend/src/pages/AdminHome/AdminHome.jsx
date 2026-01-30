import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ManageMenu from '../AdminPages/ManageMenu/ManageMenu';
import ViewOrders from '../AdminPages/ViewOrders/ViewOrders';
import ManageTables from '../AdminPages/ManageTables/ManageTables';
import './AdminHome.css';

const AdminHome = () => {
    const { userData, logout } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [stats, setStats] = useState({
        orders: 0,
        users: 0,
        items: 0,
        loading: true
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                // Fetch order stats
                const orderResponse = await fetch('https://a1-cafe-backend-07w6.onrender.com/api/order/dashboard');
                const orderData = await orderResponse.json();

                // Fetch all users count
                const usersResponse = await fetch('https://a1-cafe-backend-07w6.onrender.com/api/user/list');
                const usersData = await usersResponse.json();

                // Fetch food items count
                const foodResponse = await fetch('https://a1-cafe-backend-07w6.onrender.com/api/food/list');
                const foodData = await foodResponse.json();

                if (orderData.success && usersData.success && foodData.success) {
                    const totalOrders = orderData.data.totalOrders || 0;
                    const totalUsers = usersData.data.length || 0;
                    const totalItems = foodData.data.length || 0;

                    setStats({
                        orders: totalOrders,
                        users: totalUsers,
                        items: totalItems,
                        loading: false
                    });
                } else {
                    setStats(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchDashboardStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchDashboardStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="admin-home">
            {/* Header */}
            <header className="admin-header">
                <div className="header-top">
                    <h1 className="admin-logo">A1 Cafe Admin</h1>
                    <button className="logout-btn" onClick={logout}>
                        <span>👤</span> Logout
                    </button>
                </div>
            </header>

            {/* Sidebar Navigation */}
            <div className="admin-container">
                <nav className="admin-sidebar">
                    <button
                        className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('dashboard')}
                    >
                        <span>📊</span> Dashboard
                    </button>
                    <button
                        className={`nav-btn ${currentPage === 'menu' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('menu')}
                    >
                        <span>🍕</span> Manage Menu
                    </button>
                    <button
                        className={`nav-btn ${currentPage === 'orders' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('orders')}
                    >
                        <span>📦</span> View Orders
                    </button>
                    <button
                        className={`nav-btn ${currentPage === 'tables' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('tables')}
                    >
                        <span>🪑</span> Tables
                    </button>
                    <button
                        className={`nav-btn ${currentPage === 'users' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('users')}
                    >
                        <span>👥</span> Users
                    </button>
                </nav>

                {/* Main Content */}
                <main className="admin-content">
                    {currentPage === 'dashboard' && (
                        <>
                            {/* Welcome Section */}
                            <section className="admin-welcome">
                                <h2>Welcome back, {userData?.name}! 👋</h2>
                                <p>Manage your cafe operations from here.</p>
                            </section>

                            {/* Stats Section */}
                            <section className="stats-section">
                                <div className="stat-card">
                                    <div className="stat-icon">📦</div>
                                    <h4>Total Orders</h4>
                                    <p className="stat-number">{stats.loading ? '...' : stats.orders}</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🍽️</div>
                                    <h4>Menu Items</h4>
                                    <p className="stat-number">{stats.loading ? '...' : stats.items}</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">👥</div>
                                    <h4>Registered Users</h4>
                                    <p className="stat-number">{stats.loading ? '...' : stats.users}</p>
                                </div>
                            </section>

                            {/* Quick Actions */}
                            <section className="management-section">
                                <h3 className="section-title">Quick Actions</h3>
                                <div className="management-grid">
                                    <div className="management-card" onClick={() => setCurrentPage('menu')}>
                                        <div className="card-icon">🍕</div>
                                        <h4>Manage Menu</h4>
                                        <p>Add, edit, or remove menu items</p>
                                        <button className="management-btn">Go Now →</button>
                                    </div>
                                    <div className="management-card" onClick={() => setCurrentPage('orders')}>
                                        <div className="card-icon">📦</div>
                                        <h4>View Orders</h4>
                                        <p>Check pending and completed orders</p>
                                        <button className="management-btn">Go Now →</button>
                                    </div>
                                    <div className="management-card" onClick={() => setCurrentPage('tables')}>
                                        <div className="card-icon">🪑</div>
                                        <h4>Manage Tables</h4>
                                        <p>Add, edit, or remove tables</p>
                                        <button className="management-btn">Go Now →</button>
                                    </div>
                                    <div className="management-card" onClick={() => setCurrentPage('users')}>
                                        <div className="card-icon">👥</div>
                                        <h4>Manage Users</h4>
                                        <p>View and manage all registered users</p>
                                        <button className="management-btn">Go Now →</button>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}


                    {currentPage === 'menu' && <ManageMenu />}
                    {currentPage === 'orders' && <ViewOrders />}
                    {currentPage === 'tables' && <ManageTables />}
                    {currentPage === 'users' && (
                        <div className="user-management-placeholder">
                            <h2>User Management</h2>
                            <p>Coming soon...</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="admin-footer">
                <p>&copy; 2026 A1 Cafe Admin. All rights reserved.</p>
            </footer>
        </div >
    );
};

export default AdminHome;
