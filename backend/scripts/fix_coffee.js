import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from 'url';
import path from 'path';
import foodModel from "../models/foodModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixImage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Verify Cloundinary Config
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // 1. Find the item
        const itemName = "Coffee";
        const food = await foodModel.findOne({ name: { $regex: new RegExp(itemName, "i") } });

        if (!food) {
            console.log(`❌ Item '${itemName}' not found!`);
            return;
        }
        console.log(`✅ Found item: ${food.name}`);

        // 2. Upload the new image
        const imagePath = "C:/Users/jigya/.gemini/antigravity/brain/611aa9d0-cf0e-4ce3-ad26-70858368710b/uploaded_media_1_1769933906681.jpg";
        console.log(`Updloading image from: ${imagePath}`);

        const uploadResult = await cloudinary.uploader.upload(imagePath, {
            folder: "a1-cafe/food"
        });

        console.log(`✅ Upload successful: ${uploadResult.secure_url}`);

        // 3. Update the item
        food.image = uploadResult.secure_url;
        await food.save();

        console.log("✅ Database updated successfully!");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

fixImage();
