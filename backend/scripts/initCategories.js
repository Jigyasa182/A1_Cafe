import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import dotenv from "dotenv";

dotenv.config();

const defaultCategories = [
	{ name: "Breakfast", icon: "🥐" },
	{ name: "Main Course", icon: "🍛" },
	{ name: "Beverages", icon: "🥤" },
	{ name: "Desserts", icon: "🍰" },
];

const initCategories = async () => {
	try {
		const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/a1-cafe";
		await mongoose.connect(mongoURI);
		console.log("Connected to MongoDB");

		for (const category of defaultCategories) {
			const existing = await categoryModel.findOne({ name: category.name });
			if (!existing) {
				await categoryModel.create(category);
				console.log(`✅ Created category: ${category.name}`);
			} else {
				console.log(`⏭️  Category already exists: ${category.name}`);
			}
		}

		console.log("✅ Default categories initialized!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error initializing categories:", error);
		process.exit(1);
	}
};

initCategories();
