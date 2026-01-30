import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true }, // This will store firstName, lastName, phone, etc.
    status: { type: String, default: "Preparing" }, // Preparing, Ready, Completed, Cancelled
    orderType: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'takeaway' },
    tableId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'table',
        default: null 
    },
    tableName: { type: String, default: null }, // Store table number for reference
    payment: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;