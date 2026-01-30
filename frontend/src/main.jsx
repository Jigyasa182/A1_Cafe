import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from 'react-router-dom';

import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import StoreContextProvider from "./context/StoreContext.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<Router>
			<AuthProvider>
				<CartProvider>
					<StoreContextProvider>
						<App />
					</StoreContextProvider>
				</CartProvider>
			</AuthProvider>
		</Router>
	</StrictMode>
);