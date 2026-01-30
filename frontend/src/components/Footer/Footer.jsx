import React from 'react';
import './Footer.css';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
	const navigate = useNavigate();

	return (
		<footer className="footer-section">
			<div className="footer-content">
				<div className="footer-col brand-col">
					<div className="logo-container light">
						<span className="logo-icon">☕</span>
						<span className="logo-text">A1 Cafe</span>
					</div>
					<p>Serving our community with fresh flavors, quality ingredients, and consistent taste. A1 Cafe is proud to be your local favorite.</p>
				</div>
				<div className="footer-col">
					<h4>Quick Links</h4>
					<ul>
						<li onClick={() => navigate('/')}>Home</li>
						<li onClick={() => navigate('/menu')}>Menu</li>
						<li onClick={() => navigate('/cart')}>Cart</li>
						<li onClick={() => navigate('/orders')}>My Orders</li>
					</ul>
				</div>
				<div className="footer-col">
					<h4>Contact Us</h4>
					<ul>
						<li>📍 Near Deepak Lodge, MG Road, Kannod</li>
						<li>📞 +91 9685968315</li>
						<li>✉️ a1cafe@gmail.com</li>
					</ul>
				</div>
				<div className="footer-col">
					<h4>Hours</h4>
					<ul>
						<li>Mon - Fri: 7am - 8pm</li>
						<li>Saturday: 8am - 9pm</li>
						<li>Sunday: 8am - 6pm</li>
					</ul>
				</div>
			</div>
			<div className="footer-bottom">
				<p>&copy; 2024 A1 Cafe. All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;

