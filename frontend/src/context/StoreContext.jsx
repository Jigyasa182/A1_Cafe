import { createContext, useEffect, useState } from "react";
export const StoreContext = createContext(null);
import axios from "axios";
import { io } from "socket.io-client";

const StoreContextProvider = (props) => {
	const [cartItems, setCartItems] = useState({});
	const url = "http://a1-cafe-backend-07w6.onrender.com";
	const [token, setToken] = useState("");
	const [food_list, setFoodList] = useState([]);
	const [tableId, setTableId] = useState("");
	const [socket, setSocket] = useState(null);

	const addToCart = async (itemId) => {
		if (!cartItems[itemId]) {
			setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
		} else {
			setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
		}
		if (token) {
			try {
				await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
			} catch (error) {
				console.error("Error adding to cart:", error);
			}
		}
	};

	const removeFromCart = async (itemId) => {
		setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
		if (token) {
			try {
				await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
			} catch (error) {
				console.error("Error removing from cart:", error);
			}
		}
	};

	const getTotalCartAmount = () => {
		let totalAmount = 0;
		for (const item in cartItems) {
			if (cartItems[item] > 0) {
				let itemInfo = food_list.find((product) => product._id === item);
				if (itemInfo) {
					totalAmount += itemInfo.price * cartItems[item];
				}
			}
		}
		return totalAmount;
	};

	const getTotalCartCount = () => {
		let totalCount = 0;
		for (const item in cartItems) {
			if (cartItems[item] > 0) {
				totalCount += cartItems[item];
			}
		}
		return totalCount;
	};

	const fetchFoodList = async () => {
		try {
			const response = await axios.get(url + "/api/food/list");
			setFoodList(response.data.data.filter(item => !item.soldOut));
		} catch (error) {
			console.error("Error fetching food list:", error);
		}
	};

	const loadCartData = async (token) => {
		try {
			const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
			setCartItems(response.data.cartData);
		} catch (error) {
			console.error("Error loading cart:", error);
		}
	};

	useEffect(() => {
		async function loadData() {
			await fetchFoodList();
			if (localStorage.getItem("token")) {
				setToken(localStorage.getItem("token"));
				await loadCartData(localStorage.getItem("token"));
			}
		}
		loadData();
	}, []);

	// Listen for token updates via custom event
	useEffect(() => {
		const handleTokenUpdate = (event) => {
			const newToken = event.detail || localStorage.getItem("token");
			console.log("🔔 Token update event received:", newToken ? "Token exists" : "No token");
			setToken(newToken || "");
		};

		// Listen for custom token update events
		window.addEventListener('tokenUpdated', handleTokenUpdate);

		// Also listen for storage events (from other tabs)
		const handleStorageChange = (e) => {
			if (e.key === 'token') {
				console.log("🔔 Storage event - token changed:", e.newValue ? "Token exists" : "No token");
				setToken(e.newValue || "");
			}
		};
		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('tokenUpdated', handleTokenUpdate);
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	useEffect(() => {
		// Get tableId from URL params
		const urlParams = new URLSearchParams(window.location.search);
		const table = urlParams.get('table');
		if (table) {
			setTableId(table);
		}

		// Initialize socket with better configuration
		const newSocket = io(url, {
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5
		});

		newSocket.on('connect', () => {
			console.log('✅ Frontend socket connected:', newSocket.id);
		});

		newSocket.on('disconnect', () => {
			console.log('❌ Frontend socket disconnected');
		});

		newSocket.on('connect_error', (error) => {
			console.error('Socket connection error:', error);
		});

		setSocket(newSocket);

		return () => {
			console.log('Disconnecting frontend socket');
			newSocket.disconnect();
		};
	}, []);

	const contextValue = {
		food_list,
		cartItems,
		setCartItems,
		addToCart,
		removeFromCart,
		getTotalCartAmount,
		getTotalCartCount,
		url,
		token,
		setToken,
		tableId,
		socket,
	};

	return (
		<StoreContext.Provider value={contextValue}>
			{props.children}
		</StoreContext.Provider>
	);
};

export default StoreContextProvider;
