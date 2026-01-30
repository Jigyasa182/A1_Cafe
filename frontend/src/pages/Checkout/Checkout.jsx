import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import io from 'socket.io-client';
import './Checkout.css';

const Checkout = ({ onClose, onSuccess, onOrderPlaced }) => {
    const { cart, getTotalPrice, clearCart } = useContext(CartContext);
    const { userData, token, isAuthenticated } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [availableTables, setAvailableTables] = useState([]);

    const [formData, setFormData] = useState({
        firstName: userData?.name?.split(' ')[0] || '',
        lastName: userData?.name?.split(' ')[1] || '',
        email: userData?.email || '',
        phone: '',
        address: '',
        city: '',
        tableId: ''
    });

    // Connect to Socket.IO and fetch available tables
    useEffect(() => {
        const newSocket = io('http://localhost:4000', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to server for real-time updates');
        });

        newSocket.on('orderStatusUpdate', (data) => {
            console.log('📢 Order status updated:', data);
        });

        newSocket.on('tableUpdated', (data) => {
            console.log('📢 Table status updated:', data);
            fetchAvailableTables();
        });

        setSocket(newSocket);

        // Fetch available tables if authenticated (dine-in)
        if (isAuthenticated) {
            fetchAvailableTables();
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [isAuthenticated]);

    const fetchAvailableTables = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/table/list');
            const data = await response.json();
            if (data.success) {
                setAvailableTables(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching tables:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            setError('Your cart is empty');
            return;
        }

        // Validation based on order type
        if (isAuthenticated) {
            // Dine-in: only need table number
            if (!formData.tableId) {
                setError('Please select a table');
                return;
            }
        } else {
            // Takeaway/Delivery: need delivery details
            if (!formData.phone || !formData.address || !formData.city) {
                setError('Please fill in all required fields');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const orderData = {
                items: cart.map(item => ({
                    foodId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                amount: parseFloat(getTotalPrice()),
                address: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city
                },
                tableId: formData.tableId,
                orderType: isAuthenticated ? 'dine-in' : 'takeaway'
            };

            const result = await fetch('http://localhost:4000/api/order/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify(orderData)
            });

            const data = await result.json();

            if (data.success) {
                setOrderPlaced(true);
                setOrderId(data.orderId);
                clearCart();

                // Emit event for admin to see new order
                if (socket) {
                    socket.emit('userPlacedOrder', {
                        orderId: data.orderId,
                        user: userData?.name,
                        amount: orderData.amount
                    });
                }

                setTimeout(() => {
                    console.log('✅ Order placed successfully, closing checkout and navigating to orders');
                    onSuccess?.();
                    onClose?.();
                    // Notify parent to navigate to orders
                    onOrderPlaced?.();
                }, 2000);
            } else {
                setError(data.message || 'Failed to place order');
            }
        } catch (err) {
            console.error('Error placing order:', err);
            setError('Error placing order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="checkout-modal">
                <div className="checkout-content success">
                    <div className="success-icon">✅</div>
                    <h2>Order Placed Successfully!</h2>
                    <p>Your order has been received by the admin.</p>
                    <p className="order-id">Order ID: {orderId?.slice(-8)}</p>
                    <p className="order-amount">Total: ₹{getTotalPrice()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-modal" onClick={onClose}>
            <div className="checkout-content" onClick={(e) => e.stopPropagation()}>
                <div className="checkout-header">
                    <h2>{isAuthenticated ? '🍽️ Select Your Table' : 'Checkout'}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handlePlaceOrder} className="checkout-form">
                    {/* For Authenticated Users - Simple Dine-In */}
                    {isAuthenticated ? (
                        <>
                            <div className="form-section">
                                <h3>Welcome, {userData?.name}! 👋</h3>
                                <p className="user-email">{userData?.email}</p>
                            </div>

                            <div className="form-section">
                                <h3>Available Tables</h3>
                                <div className="tables-grid">
                                    {availableTables.length > 0 ? (
                                        availableTables.map(table => (
                                            <div
                                                key={table._id}
                                                className={`table-option ${formData.tableId === table._id ? 'selected' : ''} ${table.status !== 'available' ? 'occupied' : ''}`}
                                                onClick={() => {
                                                    if (table.status === 'available') {
                                                        setFormData(prev => ({ ...prev, tableId: table._id }));
                                                    }
                                                }}
                                            >
                                                <div className="table-number">
                                                    🪑 {table.name}
                                                </div>
                                                <div className="table-status">
                                                    {table.status === 'available' ? 'Available' : '❌ Occupied'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-tables">No tables found. Please contact staff.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* For Guest Users - Full Delivery Form */}
                            <div className="form-section">
                                <h3>Delivery Information</h3>

                                <div className="form-row">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number *"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Street Address *"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City *"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-section">
                                <h3>Pickup Option</h3>
                                <select
                                    name="tableId"
                                    value={formData.tableId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Order Type</option>
                                    <option value="Takeaway">🛍️ Takeaway</option>
                                    <option value="Delivery">🚗 Delivery</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            {cart.map(item => (
                                <div key={item._id} className="summary-item">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-total-breakdown">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{getTotalPrice()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Charges</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="summary-row total">
                                <strong>Total: ₹{getTotalPrice()}</strong>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="place-order-btn"
                        disabled={loading}
                    >
                        {loading ? '🔄 Placing Order...' : '✅ Place Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
