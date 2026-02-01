import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import foodModel from "../models/foodModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const foods = await foodModel.find({});
        console.log(`Found ${foods.length} items.`);

        foods.forEach(f => {
            console.log(`Food: ${f.name}`);
            console.log(`  Image: ${f.image}`);
            console.log("-------------------");
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

checkImages();
