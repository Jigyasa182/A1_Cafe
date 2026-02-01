import mongoose from "mongoose";
import { placeOrder, updateStatus } from "../controllers/orderController.js";
import tableModel from "../models/tableModel.js";
import orderModel from "../models/orderModel.js";
import express from 'express';

import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load from parent directory or current directory
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("MONGO URI:", process.env.MONGO_URI ? "Found" : "Missing");

// MOCK RES object
const mockRes = () => {
    const res = {};
    res.json = (data) => {
        // console.log("Response JSON:", data);
        return data;
    };
    res.status = (code) => {
        // console.log("Response Status:", code);
        return res;
    };
    return res;
};

// MOCK APP with IO
const mockApp = {
    get: (key) => {
        if (key === 'io') {
            return {
                emit: (event, data) => console.log(`[SOCKET MOCK] Emitting ${event}:`, data)
            };
        }
        return null;
    }
};

const runRepro = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Create a Table
        const tableName = "ReproTable_" + Date.now();
        const table = new tableModel({
            name: tableName,
            status: "available",
            qrCodeLink: "http://test.com"
        });
        await table.save();
        console.log(`[SETUP] Table created: ${tableName} (${table._id})`);

        // 2. Place a Dine-In Order
        const reqPlace = {
            app: mockApp,
            body: {
                userId: "testUser",
                items: [{ name: "Coffee", price: 10, quantity: 1 }],
                amount: 10,
                address: { firstName: "Test" },
                orderType: "dine-in",
                tableId: table._id.toString()
            },
            headers: {}
        };

        console.log("[ACTION] Placing Order...");
        // Calling placeOrder directly (needs mocking slightly more if it uses res directly)
        // Actually placeOrder is async and returns via res.json.
        // We need to capture the response.

        let orderId;
        const resPlace = {
            json: (data) => {
                // console.log("Place Order Response:", data);
                if (data.success) orderId = data.orderId;
                return data;
            },
            status: (c) => resPlace
        };

        await placeOrder(reqPlace, resPlace);

        if (!orderId) {
            console.error("Failed to place order");
            return;
        }
        console.log(`[SETUP] Order placed: ${orderId}`);

        // 3. Verify Table is Occupied
        let updatedTable = await tableModel.findById(table._id);
        console.log(`[VERIFY] Table Status after Order: ${updatedTable.status} (Expected: occupied)`);

        // 4. Update Status to Paid
        const reqUpdate = {
            app: mockApp,
            body: {
                orderId: orderId,
                status: "Paid"
            }
        };

        console.log("[ACTION] Updating Order to Paid...");
        await updateStatus(reqUpdate, mockRes());

        // 5. Verify Table is Available
        updatedTable = await tableModel.findById(table._id);
        console.log(`[VERIFY] Table Status after Paid: ${updatedTable.status} (Expected: available)`);

        // Clean up
        await orderModel.findByIdAndDelete(orderId);
        await tableModel.findByIdAndDelete(table._id);
        console.log("Cleanup done");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

runRepro();
