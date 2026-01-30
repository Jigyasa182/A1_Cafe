import mongoose from "mongoose";
import tableModel from "../models/tableModel.js";
import dotenv from "dotenv";

dotenv.config();

const seedTablesAndCabins = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/a1cafe");
        console.log("Connected to MongoDB");

        // Clear existing tables
        await tableModel.deleteMany({});
        console.log("Cleared existing tables");

        // Create initial seats
        const tablesData = [
            { name: "Table 1" },
            { name: "Table 2" },
            { name: "Table 3" },
            { name: "Cabin 1" },
            { name: "Cabin 2" }
        ];

        // Insert all tables and cabins
        const result = await tableModel.insertMany(tablesData);
        console.log(`✅ Successfully seeded ${result.length} items`);

        // Display created items
        const allTables = await tableModel.find({}).sort({ name: 1 });
        console.log("\n📋 Created Items:");
        allTables.forEach(table => {
            console.log(`   🪑 ${table.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding tables and cabins:", error.message);
        process.exit(1);
    }
};

seedTablesAndCabins();
