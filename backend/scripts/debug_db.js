import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import tableModel from "../models/tableModel.js";
import orderModel from "../models/orderModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const results = [];
        const occupiedTables = await tableModel.find({ status: 'occupied' });

        for (const t of occupiedTables) {
            const tableInfo = { name: t.name, id: t._id, status: t.status };

            // Find latest order for this table
            const lastOrder = await orderModel.findOne({ tableId: t._id }).sort({ createdAt: -1 });

            if (lastOrder) {
                tableInfo.lastOrder = {
                    id: lastOrder._id,
                    status: lastOrder.status,
                    type: lastOrder.orderType,
                    payment: lastOrder.payment
                };
            } else {
                const lastOrderByName = await orderModel.findOne({ tableName: t.name }).sort({ createdAt: -1 });
                if (lastOrderByName) {
                    tableInfo.lastOrderByName = {
                        id: lastOrderByName._id,
                        status: lastOrderByName.status
                    };
                }
            }
            results.push(tableInfo);
        }
        console.log("JSON_OUTPUT_START");
        console.log(JSON.stringify(results, null, 2));
        console.log("JSON_OUTPUT_END");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
