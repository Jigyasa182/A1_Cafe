import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { generateReceipt } from '../../utils/pdfGenerator';

const MyOrders = () => {
  const { url, token, socket } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const currentToken = token || localStorage.getItem('token');

      if (!currentToken) {
        console.log("❌ No token found in context or localStorage");
        setIsLoading(false);
        return;
      }

      console.log("🔍 Fetching orders with token:", currentToken.slice(0, 10) + "...");
      console.log("🔍 Full token:", currentToken);

      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token: currentToken } }
      );

      console.log("📡 API Response:", response.data);
      if (response.data.success) {
        setOrders(response.data.data || []);
        console.log("✅ Orders fetched:", response.data.data.length, "orders");
      } else {
        console.log("❌ API returned error:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders when component mounts or token changes
  useEffect(() => {
    console.log("🔄 Token changed, fetching orders. Token:", token ? "exists" : "null");
    fetchOrders();
  }, [token]);

  // Also fetch on mount to ensure we get orders even if token is already set
  useEffect(() => {
    console.log("📱 MyOrders component mounted");
    fetchOrders();
  }, []);

  // Listen for real-time order updates via socket
  useEffect(() => {
    if (socket) {
      socket.on('orderStatusUpdate', (data) => {
        console.log('📢 Order status updated:', data);
        // Refresh orders when status changes
        fetchOrders();
      });

      socket.on('newOrder', () => {
        console.log('📢 New order placed');
        // Refresh orders when new order is placed
        fetchOrders();
      });
    }

    return () => {
      if (socket) {
        socket.off('orderStatusUpdate');
        socket.off('newOrder');
      }
    };
  }, [socket]);

  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Preparing':
        return '#ffc107';
      case 'Served':
        return '#17a2b8';
      case 'Paid':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'Preparing':
        return '👨‍🍳';
      case 'Served':
        return '🍽️';
      case 'Paid':
        return '✅';
      default:
        return '📦';
    }
  };

  if (!token && !localStorage.getItem('token')) {
    return (
      <div className='my-orders'>
        <h2>My Orders</h2>
        <div className="no-orders">
          <p>Please login to view your orders</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='my-orders'>
        <h2>My Orders</h2>
        <div className="no-orders">
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders yet. Start ordering!</p>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order, index) => {
            const isExpanded = expandedOrders[order._id];
            const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

            return (
              <div key={index} className={`order-card ${isExpanded ? 'active' : ''}`}>
                <div className="order-header" onClick={() => toggleOrder(order._id)}>
                  <div className="order-header-main">
                    <div className="order-branding">
                      <span className="order-type-icon">
                        {order.orderType === 'dine-in' ? '🍽️' : '🛍️'}
                      </span>
                      <div className="order-id-group">
                        <span className="label">Order #{order._id.slice(-6).toUpperCase()}</span>
                        <span className="order-date-small">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="order-items-preview">
                      <p className="preview-text">
                        {order.items.map(i => i.name).slice(0, 2).join(", ")}
                        {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="order-header-right">
                    <div className="order-summary-value">
                      <span className="total-amount-small">₹{order.amount}</span>
                      <span className="item-count-badge">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className={`order-status-pill status-${order.status}`}>
                      <span className="status-dot-blink"></span>
                      {order.status}
                    </div>
                    <span className={`expand-arrow ${isExpanded ? 'up' : 'down'}`}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-details-expanded">
                    <div className="order-info-grid">
                      <div className="info-item">
                        <span className="info-label">📅 Date & Time</span>
                        <span className="info-value">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">📍 Service Mode</span>
                        <span className="info-value">
                          {order.orderType === 'dine-in' ? (order.tableName || `Table ${order.tableId || '?'}`) : "Takeaway / Delivery"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">🏷️ Status</span>
                        <span className="info-value" style={{ color: getStatusColor(order.status) }}>{order.status}</span>
                      </div>
                    </div>

                    <div className="order-items-list">
                      <h4>Items Details</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-lite">
                          <div className="item-main">
                            <span className="item-name">{item.name}</span>
                            <span className="item-qty">x{item.quantity}</span>
                          </div>
                          <span className="item-price">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer-expanded">
                      <div className="total-row">
                        <span>Grand Total</span>
                        <span className="final-price">₹{order.amount}</span>
                      </div>
                      {order.status === 'Preparing' && (
                        <p className="status-note">🔥 Your order is being prepared in our kitchen.</p>
                      )}
                      {order.status === 'Served' && (
                        <p className="status-note">🍽️ Your order has been served! Enjoy your meal!</p>
                      )}
                      {['Paid', 'Completed'].includes(order.status) && (
                        <div className="receipt-section">
                          <p className="status-note">✅ Transaction completed. Thank you!</p>
                          <button
                            className="user-receipt-btn"
                            onClick={() => generateReceipt(order)}
                          >
                            📄 Download Receipt PDF
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;