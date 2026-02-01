import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import tableModel from "../models/tableModel.js";
import orderModel from "../models/orderModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetTables = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const occupiedTables = await tableModel.find({ status: 'occupied' });
        console.log(`Found ${occupiedTables.length} occupied tables.`);

        for (const t of occupiedTables) {
            // Find latest order
            const lastOrder = await orderModel.findOne({ tableId: t._id }).sort({ createdAt: -1 });

            if (lastOrder) {
                if (['Paid', 'Completed', 'Cancelled'].includes(lastOrder.status)) {
                    console.log(`Table ${t.name} is occupied but last order ${lastOrder.status}. Clearing...`);
                    t.status = 'available';
                    await t.save();
                    console.log(`✅ Table ${t.name} cleared.`);
                } else {
                    console.log(`Table ${t.name} is properly occupied by order ${lastOrder._id} (Status: ${lastOrder.status})`);
                }
            } else {
                console.log(`Table ${t.name} has no orders. Clearing...`);
                t.status = 'available';
                await t.save();
                console.log(`✅ Table ${t.name} cleared.`);
            }
        }
        console.log("Reset complete.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

resetTables();
