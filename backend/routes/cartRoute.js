import express from "express"
import { addToCart, removeFromCart, getCart, clearCart, getCartByToken, updateCartByToken } from "../controllers/cartController.js"
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.post("/get", getCartByToken);  // New endpoint - uses token from header
cartRouter.post("/update", updateCartByToken);  // New endpoint - uses token from header
cartRouter.post("/clear", authMiddleware, clearCart);

export default cartRouter;