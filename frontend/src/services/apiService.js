const API_URL = 'https://a1-cafe-backend-07w6.onrender.com/api';

export const apiService = {
    // Auth endpoints
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        return response.json();
    },

    // Category endpoints
    getCategories: async () => {
        const response = await fetch(`${API_URL}/category/list`);
        return response.json();
    },

    addCategory: async (categoryData, token) => {
        const response = await fetch(`${API_URL}/category/add`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });
        return response.json();
    },

    // Food endpoints
    getAllFoods: async () => {
        const response = await fetch(`${API_URL}/food/list`);
        return response.json();
    },

    getFoodsByCategory: async (categoryId) => {
        const response = await fetch(`${API_URL}/food/category/${categoryId}`);
        return response.json();
    },

    addFood: async (foodData, token) => {
        // If foodData is FormData, don't set Content-Type header (browser sets it with boundary)
        const headers = { 'Authorization': token };
        if (!(foodData instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}/food/add`, {
            method: 'POST',
            headers: headers,
            body: foodData instanceof FormData ? foodData : JSON.stringify(foodData)
        });
        return response.json();
    },

    updateFood: async (foodData, token) => {
        // If foodData is FormData, don't set Content-Type header (browser sets it with boundary)
        const headers = { 'Authorization': token };
        if (!(foodData instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}/food/update`, {
            method: 'POST',
            headers: headers,
            body: foodData instanceof FormData ? foodData : JSON.stringify(foodData)
        });
        return response.json();
    },

    // Order endpoints
    createOrder: async (orderData, token) => {
        const response = await fetch(`${API_URL}/order/place`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        return response.json();
    },

    getUserOrders: async (token) => {
        const response = await fetch(`${API_URL}/order/userorders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({})
        });
        return response.json();
    },

    getAllOrders: async (token) => {
        const response = await fetch(`${API_URL}/order/list`, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        return response.json();
    },

    // Cart endpoints
    addToCart: async (userId, foodId, quantity, token) => {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, foodId, quantity })
        });
        return response.json();
    }
};

