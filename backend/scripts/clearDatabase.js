import mongoose from "mongoose";
import tableModel from "../models/tableModel.js";
import dotenv from "dotenv";

dotenv.config();

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/a1cafe");
        console.log("Connected to MongoDB");

        await tableModel.deleteMany({});
        console.log("✅ Database cleared - All tables deleted");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

clearDatabase();
