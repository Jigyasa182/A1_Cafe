import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import io from 'socket.io-client';
import { generateReceipt } from '../../../utils/pdfGenerator';
import './ViewOrders.css';

const ViewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [socket, setSocket] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchOrders();
        setupSocket();
    }, []);

    const setupSocket = () => {
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const newSocket = io(backendUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('✅ Admin connected to real-time updates');
        });

        newSocket.on('newOrder', (order) => {
            console.log('📢 New order received:', order);
            setOrders(prev => [order, ...prev]);

            // Show notification
            setNotification({
                type: 'success',
                message: `🎉 New order from ${order.address?.firstName || 'Customer'}!`,
                orderId: order._id
            });
            setTimeout(() => setNotification(null), 5000);
        });

        newSocket.on('orderStatusUpdate', (data) => {
            console.log('📢 Order status updated:', data);
            setOrders(prev =>
                prev.map(order =>
                    order._id === data.orderId
                        ? { ...order, status: data.status }
                        : order
                )
            );
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await apiService.getAllOrders(token);
            if (data.success) {
                setOrders(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
            const response = await fetch(`${backendUrl}/api/order/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    orderId,
                    status: newStatus
                })
            });

            const data = await response.json();
            if (data.success) {
                // Socket will handle the update
                console.log('✅ Status updated successfully');
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };


    const handleDeleteOrder = async (orderId, orderStatus) => {
        if (!['Paid', 'Completed', 'Cancelled'].includes(orderStatus)) {
            setNotification({
                type: 'error',
                message: '❌ Can only delete completed or cancelled orders'
            });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
            const response = await fetch(`${backendUrl}/api/order/delete/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            });

            const data = await response.json();
            if (data.success) {
                setOrders(prev => prev.filter(order => order._id !== orderId));
                setNotification({
                    type: 'success',
                    message: '✅ Order deleted successfully'
                });
                setTimeout(() => setNotification(null), 3000);
            } else {
                setNotification({
                    type: 'error',
                    message: data.message || 'Error deleting order'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (err) {
            console.error('Error deleting order:', err);
            setNotification({
                type: 'error',
                message: 'Error deleting order'
            });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

    return (
        <div className="view-orders">
            <h2>All Orders</h2>

            {/* Notification */}
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="filter-controls">
                <button
                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                >
                    All Orders ({orders.length})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'Preparing' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Preparing')}
                >
                    Preparing ({orders.filter(o => o.status === 'Preparing').length})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'Ready' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Ready')}
                >
                    Ready ({orders.filter(o => o.status === 'Ready').length})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'Paid' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Paid')}
                >
                    Paid ({orders.filter(o => o.status === 'Paid' || o.status === 'Completed').length})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'Cancelled' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Cancelled')}
                >
                    Cancelled ({orders.filter(o => o.status === 'Cancelled').length})
                </button>
            </div>

            {loading ? (
                <p className="loading">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
                <p className="empty">No orders found</p>
            ) : (
                <div className="orders-grid">
                    {filteredOrders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h4>Order #{order._id?.slice(0, 8)}</h4>
                                    <p className="order-time">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <select
                                    value={order.status || 'Preparing'}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className={`status-select status-${order.status}`}
                                >
                                    <option value="Preparing">🔄 Preparing</option>
                                    <option value="Ready">✅ Ready</option>
                                    <option value="Paid">🎉 Paid</option>
                                    <option value="Cancelled">❌ Cancelled</option>
                                </select>
                            </div>

                            <div className="order-customer">
                                <p><strong>👤 {order.address?.firstName} {order.address?.lastName}</strong></p>
                            </div>

                            <div className="order-items">
                                <h5>Items:</h5>
                                <ul>
                                    {order.items?.map((item, idx) => (
                                        <li key={idx}>
                                            {item.name} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <strong>Total: ₹{order.amount?.toFixed(2) || '0.00'}</strong>
                                </div>
                                <div className="order-details">
                                    <span className="order-type">
                                        {order.orderType === 'dine-in' ? '🍽️ Dine-In' :
                                            order.orderType === 'takeaway' ? '🛍️ Takeaway' :
                                                '🚗 Delivery'}
                                    </span>
                                    {order.tableName && <span className="table-info">{order.tableName}</span>}
                                </div>
                            </div>

                            {['Paid', 'Completed'].includes(order.status) && (
                                <button
                                    className="download-receipt-btn"
                                    onClick={() => generateReceipt(order)}
                                >
                                    📄 Download Receipt
                                </button>
                            )}

                            {['Paid', 'Completed', 'Cancelled'].includes(order.status) && (
                                <button
                                    className="delete-order-btn"
                                    onClick={() => handleDeleteOrder(order._id, order.status)}
                                >
                                    🗑️ Delete Order
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewOrders;
