import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './ExploreMenu.css';

const ExploreMenu = ({ selectedCategory, onSelectCategory }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiService.getCategories();
                if (data.success) {
                    setCategories(data.data);
                } else {
                    // Fallback categories
                    setCategories([
                        { _id: '1', name: 'Breakfast', image: '🥐' },
                        { _id: '2', name: 'Main Course', image: '🍛' },
                        { _id: '3', name: 'Beverages', image: '🥤' },
                        { _id: '4', name: 'Desserts', image: '🍰' },
                        { _id: '5', name: 'Snacks', image: '🥪' }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                // Fallback categories
                setCategories([
                    { _id: '1', name: 'Breakfast', image: '🥐' },
                    { _id: '2', name: 'Main Course', image: '🍛' },
                    { _id: '3', name: 'Beverages', image: '🥤' },
                    { _id: '4', name: 'Desserts', image: '🍰' },
                    { _id: '5', name: 'Snacks', image: '🥪' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="explore-menu">
            {loading ? (
                <p className="loading">Loading categories...</p>
            ) : (
                <div className="explore-menu-list">
                    {/* All button */}
                    <div
                        className={`explore-menu-list-item ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('all')}
                    >
                        <div>
                            <p>All</p>
                        </div>
                    </div>

                    {/* Category buttons */}
                    {categories.map(category => (
                        <div
                            key={category._id}
                            className={`explore-menu-list-item ${selectedCategory === category.name ? 'active' : ''}`}
                            onClick={() => onSelectCategory(category.name)}
                        >
                            <div>
                                <p>{category.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreMenu;
