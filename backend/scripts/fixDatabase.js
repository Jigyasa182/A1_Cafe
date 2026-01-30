import mongoose from "mongoose";
import tableModel from "../models/tableModel.js";
import dotenv from "dotenv";

dotenv.config();

const fixDatabase = async () => {
    try {
        // Connect to MongoDB using the correct URI from .env
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/a1-cafe");
        console.log("Connected to MongoDB:", mongoose.connection.name);

        // Drop the legacy unique index that is causing the duplicate key error
        try {
            await tableModel.collection.dropIndex("tableNumber_1_type_1");
            console.log("✅ Successfully dropped legacy index: tableNumber_1_type_1");
        } catch (err) {
            console.log("ℹ️ Index tableNumber_1_type_1 already gone or not found");
        }

        // Cleanup any other old indexes
        try {
            await tableModel.collection.dropIndexes();
            console.log("✅ All other legacy indexes cleared");
        } catch (err) {
            console.log("ℹ️ No other indexes to clear");
        }

        // Delete all tables
        await tableModel.deleteMany({});
        console.log("✅ Cleared all existing tables");

        // Create initial seats
        const tablesData = [
            { name: "Table 1" },
            { name: "Table 2" },
            { name: "Table 3" },
            { name: "Cabin 1" },
            { name: "Cabin 2" }
        ];

        const result = await tableModel.insertMany(tablesData);
        console.log(`✅ Seeded ${result.length} items successfully`);

        const allTables = await tableModel.find({}).sort({ name: 1 });
        console.log("\n📋 Database Contents:");
        allTables.forEach(table => {
            console.log(`   🪑 ${table.name} - Status: ${table.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

fixDatabase();
