import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import './ManageMenu.css';

const ManageMenu = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFood, setEditingFood] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: ''
    });

    useEffect(() => {
        fetchFoods();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await apiService.getCategories();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchFoods = async () => {
        try {
            const data = await apiService.getAllFoods();
            if (data.success) {
                setFoods(data.data);
            }
        } catch (err) {
            console.error('Error fetching foods:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setShowForm(true);
        setEditingFood(null);
        setFormData({ name: '', description: '', price: '', category: '' });
        setImageFile(null);
    };

    const handleEditClick = (food) => {
        setEditingFood(food);
        setShowForm(true);
        setFormData({
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category || ''
        });
        setImageFile(null);
    };

    const handleAddNewCategory = async () => {
        const newCat = prompt("Enter new category name:");
        if (newCat) {
            const token = localStorage.getItem('token');
            const res = await apiService.addCategory({ name: newCat }, token);
            if (res.success) {
                fetchCategories();
                setFormData(prev => ({ ...prev, category: newCat }));
            } else {
                alert("Failed to add category");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("category", formData.category);
            if (imageFile) {
                data.append("image", imageFile);
            } else if (editingFood && !imageFile) {
                // If editing and no new image, we might need to handle this differently 
                // depending on backend. Usually bad if backend expects image but here we only add if exists
                // For now, if editing and no new image, backend might need 'image' field?
                // The backend uses upload.single("image"). If req.file is missing, it errors "Image is required".
                // But wait, updateFood in backend handles validation.
                // Actually this handleSubmit only calls addFood now? No logic for updateFood yet?
                // Ah, original code used addFood for both? No, wait.
                // Original code used apiService.addFood for submit.
                // I should check if I need updateFood logic.
            }

            let result;
            if (editingFood) {
                // Append ID for update
                data.append("id", editingFood._id);
                result = await apiService.updateFood(data, token);
            } else {
                if (!imageFile) {
                    alert("Image is required!");
                    return;
                }
                result = await apiService.addFood(data, token);
            }

            if (result.success) {
                setShowForm(false);
                setEditingFood(null);
                fetchFoods();
                alert('Food item saved successfully!');
            } else {
                alert('Error saving food item: ' + result.message);
            }
        } catch (err) {
            console.error('Error saving food:', err);
            alert('Error saving food item');
        }
    };

    return (
        <div className="manage-menu">
            <h2>Manage Menu</h2>

            {!showForm ? (
                <>
                    <button className="add-btn" onClick={handleAddClick}>
                        ➕ Add New Item
                    </button>

                    {loading ? (
                        <p>Loading menu items...</p>
                    ) : (
                        <div className="menu-list">
                            {foods.length === 0 ? (
                                <p>No menu items yet</p>
                            ) : (
                                foods.map(food => (
                                    <div key={food._id} className="menu-item-card">
                                        <img
                                            src={`http://localhost:4000/images/${food.image}`}
                                            alt={food.name}
                                            className="item-img"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                        />
                                        <div className="item-info">
                                            <h4>{food.name}</h4>
                                            <p>{food.description}</p>
                                            <p className="price">₹{food.price}</p>
                                            <p className="category">🏷️ {food.category}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditClick(food)}
                                            >
                                                Edit
                                            </button>
                                            <button className="delete-btn">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="form-container">
                    <h3>{editingFood ? 'Edit Item' : 'Add New Item'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Image Upload</label>
                            <input
                                type="file"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                required={!editingFood}
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Food Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />

                        <div className="category-select-group">
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={handleAddNewCategory} className="small-btn">
                                + New
                            </button>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">Save</button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
