import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import tableModel from "../models/tableModel.js";
import jwt from "jsonwebtoken";

// Placing user order from frontend
const placeOrder = async (req, res) => {
    try {
        console.log("🔥 Received order request:", req.body);

        const io = req.app.get('io');

        let userInfo = {
            firstName: "Guest",
            lastName: "",
            phone: "",
            email: ""
        };

        let actualUserId = "guest";

        if (req.headers.token) {
            try {
                const token_decode = jwt.verify(req.headers.token, process.env.JWT_SECRET);
                actualUserId = token_decode.id;

                const user = await userModel.findById(actualUserId);
                if (user) {
                    userInfo.firstName = user.name || "Guest";
                    userInfo.phone = user.phone || "";
                    userInfo.email = user.email || "";
                    console.log("✅ User found:", user.name);
                }
            } catch (error) {
                console.log("⚠️ Token decode failed, using guest");
            }
        }

        if (req.body.address) {
            userInfo = {
                firstName: req.body.address.firstName || userInfo.firstName,
                lastName: req.body.address.lastName || userInfo.lastName,
                phone: req.body.address.phone || userInfo.phone,
                email: req.body.address.email || userInfo.email
            };
        }

        // Handle table reservation for dine-in orders
        let tableRef = null;
        let tableName = null;

        if (req.body.orderType === 'dine-in' && req.body.tableId) {
            try {
                // Check if table is already occupied
                const checkTable = await tableModel.findById(req.body.tableId);
                if (checkTable && checkTable.status !== 'available') {
                    console.log("⚠️ Attempted to order for an occupied seat:", checkTable.name);
                    return res.json({ success: false, message: `The seat "${checkTable.name}" is already occupied. please choose another seat.` });
                }

                const table = await tableModel.findByIdAndUpdate(
                    req.body.tableId,
                    {
                        status: 'occupied',
                        updatedAt: new Date()
                    },
                    { new: true }
                );

                if (table) {
                    tableRef = table._id;
                    tableName = table.name;
                    console.log("✅ Seat marked as occupied:", tableName);
                }
            } catch (err) {
                console.log("⚠️ Error updating table:", err);
            }
        }

        const newOrder = new orderModel({
            userId: actualUserId,
            items: req.body.items,
            amount: req.body.amount,
            address: userInfo,
            orderType: req.body.orderType || 'takeaway',
            tableId: tableRef,
            tableName: tableName,
            status: "Preparing"
        });

        await newOrder.save();
        console.log("✅ Order saved:", newOrder._id);
        console.log("📍 Order UserId:", actualUserId);
        console.log("📦 Order Details:", {
            id: newOrder._id,
            userId: newOrder.userId,
            amount: newOrder.amount,
            status: newOrder.status
        });

        if (actualUserId && actualUserId !== "guest") {
            // Clear both old and new cart formats
            await userModel.findByIdAndUpdate(actualUserId, {
                cartData: {},
                cartArray: []
            });
            console.log("🛒 Cart cleared for user:", actualUserId);
        }

        if (io) {
            io.emit('newOrder', newOrder);
            console.log('📢 New order event emitted');

            // Emit table update if dine-in
            if (req.body.orderType === 'dine-in') {
                io.emit('tableUpdated', {
                    tableId: tableRef,
                    status: 'occupied',
                    orderId: newOrder._id
                });
            }
        }

        res.json({ success: true, message: "Order Placed Successfully", orderId: newOrder._id });
    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ success: false, message: error.message || "Error placing order" });
    }
};

// User orders for frontend
const userOrders = async (req, res) => {
    try {
        // Prefer userId set by authMiddleware (safer), fall back to decoding token
        let userId = req.body && req.body.userId ? req.body.userId : null;

        // Log incoming headers for debugging
        console.log('🔍 userOrders request headers:', { token: req.headers.token, authorization: req.headers.authorization });

        if (!userId) {
            const token = req.headers.token;
            if (!token) {
                console.log('❌ No token provided and no userId in request body');
                return res.json({ success: false, message: "Not authorized" });
            }
            try {
                const token_decode = jwt.verify(token, process.env.JWT_SECRET);
                userId = token_decode.id;
            } catch (err) {
                console.log('⚠️ Token decode failed in userOrders:', err.message);
                return res.json({ success: false, message: "Not authorized" });
            }
        }

        console.log(`🔎 Fetching orders for UserID: ${userId}`);
        const orders = await orderModel.find({ userId: userId }).sort({ createdAt: -1 });
        console.log(`📊 Found ${orders.length} orders for user ${userId}`);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// Update order status
const updateStatus = async (req, res) => {
    try {
        const io = req.app.get('io');

        const order = await orderModel.findByIdAndUpdate(
            req.body.orderId,
            {
                status: req.body.status,
                updatedAt: new Date()
            },
            { new: true }
        );

        // If order is completed or cancelled and it was dine-in, clear the table
        if (['Completed', 'Cancelled'].includes(req.body.status) && order.orderType === 'dine-in' && order.tableId) {
            try {
                await tableModel.findByIdAndUpdate(
                    order.tableId,
                    {
                        status: 'available',
                        currentOrderId: null,
                        updatedAt: new Date()
                    }
                );
                console.log("✅ Table cleared for completed order");

                // Emit table updated event
                if (io) {
                    io.emit('tableUpdated', {
                        tableId: order.tableId,
                        status: 'available'
                    });
                }
            } catch (err) {
                console.log("⚠️ Error clearing table:", err);
            }
        }

        if (io) {
            io.emit('orderStatusUpdate', {
                orderId: req.body.orderId,
                status: req.body.status
            });
            console.log('📢 Order status update emitted');
        }

        res.json({ success: true, message: "Status Updated", data: order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log("🗑️ Delete order request for ID:", orderId);

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID missing"
            });
        }

        const deleted = await orderModel.findByIdAndDelete(orderId);

        if (!deleted) {
            console.log("❌ Order not found:", orderId);
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        console.log("✅ Order deleted successfully:", orderId);
        res.json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.error("❌ Delete order error:", error);
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message
        });
    }
};



// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        const activeOrders = await orderModel.countDocuments({
            status: { $in: ["Preparing", "Served"] }
        });
        const paidOrders = await orderModel.find({ status: "Paid" });
        const totalSales = paidOrders.reduce((sum, order) => sum + order.amount, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await orderModel.find({
            status: "Paid",
            date: { $gte: today }
        });
        const todaySales = todayOrders.reduce((sum, order) => sum + order.amount, 0);

        res.json({
            success: true,
            data: {
                totalOrders,
                activeOrders,
                totalSales,
                todaySales
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching dashboard stats" });
    }
};

export { listOrders, placeOrder, updateStatus, userOrders, getDashboardStats, deleteOrder };