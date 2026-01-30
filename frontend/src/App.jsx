import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage/AuthPage";
import AdminHome from "./pages/AdminHome/AdminHome";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import MyOrders from "./pages/MyOrders/MyOrders";

const App = () => {
	const { isAuthenticated, userRole, loading } = useContext(AuthContext);

	if (loading) {
		return (
			<div style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
				fontSize: '1.2rem',
				color: '#c97856'
			}}>
				Loading...
			</div>
		);
	}

	if (!isAuthenticated) {
		return <AuthPage />;
	}

	if (userRole === 'admin') {
		return <AdminHome />;
	}

	// User Routes
	return (
		<Routes>
			<Route path="/" element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="menu" element={<Menu />} />
				<Route path="cart" element={<Cart />} />
				<Route path="orders" element={<MyOrders />} />
			</Route>
		</Routes>
	);
};

export default App;
