import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './FloatingCart.css';

const FloatingCart = () => {
    const { getTotalItems } = useContext(CartContext);
    const navigate = useNavigate();
    const totalItems = getTotalItems();

    // If we want to hide it on Cart page, we could check location, 
    // but user asked for "click at cart not sidebar".
    // A persistent quick-access button is still useful on Home/Menu.

    return (
        <button
            className="floating-cart-btn"
            onClick={() => navigate('/cart')}
            title="View Cart"
        >
            <div className="cart-icon-wrapper">
                <span className="cart-icon">🛒</span>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
        </button>
    );
};

export default FloatingCart;