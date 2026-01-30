import React, { useState, useEffect, useContext } from 'react';
import { apiService } from '../../services/apiService';
import { CartContext } from '../../context/CartContext';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import './Menu.css';

const Menu = () => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useContext(CartContext);
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const data = await apiService.getAllFoods();
        if (data.success) {
          setFoods(data.data);
          setFilteredFoods(data.data);
        } else {
          setError('Failed to load menu');
        }
      } catch (err) {
        console.error('Error fetching foods:', err);
        setError('Unable to load menu. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  useEffect(() => {
    let result = foods;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(food => food.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      result = result.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFoods(result);
  }, [selectedCategory, searchQuery, foods]);

  // Helper to check if item is in cart
  const getCartItemQuantity = (id) => {
    const item = cart.find(item => item._id === id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="menu-page">
      <div className="menu-container">

        {/* Menu Header with Pill and Title */}
        <div className="menu-header-wrapper">
          <div className="fresh-pill">
            <span className="sparkle">✨</span> Freshly Made Daily
          </div>
          <h2 className="section-header">Our Menu</h2>
          <p className="section-subheader">A variety of food and drinks to satisfy every craving, any time of the day.</p>

          {/* Search Bar */}
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search for coffee, pastries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <ExploreMenu
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="food-display">
          {loading && <div className="loading-spinner"></div>}
          {error && <p className="error-msg">{error}</p>}

          {!loading && !error && (
            <div className="food-grid">
              {filteredFoods.map((item) => {
                const quantity = getCartItemQuantity(item._id);

                return (
                  <div key={item._id} className="food-card">
                    <div className="food-card-img-container">
                      <img src={`http://a1-cafe-backend-07w6.onrender.com/images/${item.image}`} alt={item.name} />
                    </div>
                    <div className="food-card-info">
                      <div className="food-card-name-rating">
                        <h4>{item.name}</h4>
                      </div>
                      <p className="food-card-desc">{item.description}</p>
                      <div className="food-card-bottom">
                        <p className="food-card-price">₹{item.price}</p>

                        {/* Quantity Logic */}
                        {quantity === 0 ? (
                          <button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(item)}
                            title="Add to Cart"
                          >
                            +
                          </button>
                        ) : (
                          <div className="quantity-controls">
                            <button
                              className="qty-btn minus"
                              onClick={() => updateQuantity(item._id, quantity - 1)}
                            >-</button>
                            <span className="qty-value">{quantity}</span>
                            <button
                              className="qty-btn plus"
                              onClick={() => updateQuantity(item._id, quantity + 1)}
                            >+</button>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;