import React, { useContext, useState } from 'react';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Checkout from '../Checkout/Checkout'; // Ensure path is correct or adjust if Checkout is in pages
import './Cart.css';

const Cart = () => {
	const { cart, getTotalPrice, removeFromCart, updateQuantity } = useContext(CartContext);
	const navigate = useNavigate();
	const [showCheckout, setShowCheckout] = useState(false);

	const subtotal = getTotalPrice();
	const deliveryFee = 0;
	const finalTotal = (parseFloat(subtotal) + deliveryFee).toFixed(2);

	return (
		<div className="cart-page">
			<h1 className="page-title">Your Cart</h1>

			<div className="cart-container">
				{cart.length === 0 ? (
					<div className="empty-cart-message">
						<h2>Your cart is empty</h2>
						<p>Looks like you haven't added anything yet.</p>
						<button className="btn-primary" onClick={() => navigate('/menu')}>
							Browse Menu
						</button>
					</div>
				) : (
					<div className="cart-content-wrapper">
						{/* Left: Cart Items */}
						<div className="cart-items-list">
							{cart.map(item => (
								<div key={item._id} className="cart-item-row">
									<div className="item-info">
										<img
											src={`http://localhost:4000/images/${item.image}`}
											alt={item.name}
											className="item-img"
										/>
										<div>
											<h4>{item.name}</h4>
											<p>₹{item.price}</p>
										</div>
									</div>

									<div className="item-quantity">
										<button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
										<span>{item.quantity}</span>
										<button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
									</div>

									<div className="item-total-price">
										₹{(item.price * item.quantity).toFixed(2)}
									</div>

									<button
										className="delete-btn"
										onClick={() => removeFromCart(item._id)}
									>
										✕
									</button>
								</div>
							))}
						</div>

						{/* Right: Order Summary */}
						<div className="order-summary-card">
							<h3>Order Summary</h3>
							<div className="summary-details">
								<div className="summary-row">
									<span>Subtotal</span>
									<span>₹{subtotal}</span>
								</div>
								<div className="summary-row">
									<span>Charges</span>
									<span>₹{deliveryFee.toFixed(2)}</span>
								</div>
								<div className="divider"></div>
								<div className="summary-row total">
									<span>Total</span>
									<span>₹{finalTotal}</span>
								</div>
							</div>
							<button
								className="checkout-btn-full"
								onClick={() => setShowCheckout(true)}
							>
								Proceed to Checkout
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Checkout Modal - Reused */}
			{showCheckout && (
				<Checkout
					onClose={() => setShowCheckout(false)}
					onOrderPlaced={() => {
						setShowCheckout(false);
						navigate('/orders');
					}}
				/>
			)}
		</div>
	);
};

export default Cart;