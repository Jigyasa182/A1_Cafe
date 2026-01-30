import express from "express"
import authMiddleWare from "../middleware/auth.js"
import { listOrders, placeOrder, updateStatus, userOrders, getDashboardStats, deleteOrder } from "../controllers/orderController.js"

const orderRouter = express.Router();

orderRouter.post("/place", placeOrder);
orderRouter.post("/userorders", authMiddleWare, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.get("/dashboard", getDashboardStats);
orderRouter.post("/status", updateStatus);
orderRouter.delete("/delete/:id", deleteOrder);

export default orderRouter;