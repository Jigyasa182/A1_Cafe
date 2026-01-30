import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { token, isAuthenticated } = useContext(AuthContext);
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from backend when user logs in
    useEffect(() => {
        if (isAuthenticated && token) {
            // Fetch cart from server
            const fetchCart = async () => {
                try {
                    const response = await fetch('https://a1-cafe-backend-07w6.onrender.com/api/cart/get', {
                        method: 'POST',
                        headers: {
                            'token': token,
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await response.json();
                    if (data.success && data.cartData) {
                        setCart(data.cartData);
                    } else {
                        setCart([]);
                    }
                } catch (error) {
                    console.error('Error fetching cart:', error);
                    setCart([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCart();
        } else {
            // Guest user - use localStorage
            const saved = localStorage.getItem('guest_cart');
            setCart(saved ? JSON.parse(saved) : []);
            setIsLoading(false);
        }
    }, [isAuthenticated, token]);

    // Save cart whenever it changes
    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated && token) {
            // Save to backend for logged-in users
            const saveCart = async () => {
                try {
                    await fetch('https://a1-cafe-backend-07w6.onrender.com/api/cart/update', {
                        method: 'POST',
                        headers: {
                            'token': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cart })
                    });
                } catch (error) {
                    console.error('Error saving cart:', error);
                }
            };
            saveCart();
        } else {
            // Save to localStorage for guests
            localStorage.setItem('guest_cart', JSON.stringify(cart));
        }
    }, [cart, isAuthenticated, token, isLoading]);

    const addToCart = (food) => {
        const existingItem = cart.find(item => item._id === food._id);

        if (existingItem) {
            setCart(cart.map(item =>
                item._id === food._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...food, quantity: 1 }]);
        }
    };

    const removeFromCart = (foodId) => {
        setCart(cart.filter(item => item._id !== foodId));
    };

    const updateQuantity = (foodId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(foodId);
        } else {
            setCart(cart.map(item =>
                item._id === foodId
                    ? { ...item, quantity }
                    : item
            ));
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalPrice,
            getTotalItems,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};
