import categoryModel from "../models/categoryModel.js";

// Get all categories
const getAllCategories = async (req, res) => {
	try {
		const categories = await categoryModel.find({ isActive: true }).sort({ name: 1 });
		res.json({ success: true, data: categories });
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.json({ success: false, message: "Error fetching categories" });
	}
};

// Get all categories (including inactive) - for admin
const getAllCategoriesAdmin = async (req, res) => {
	try {
		const categories = await categoryModel.find({}).sort({ name: 1 });
		res.json({ success: true, data: categories });
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.json({ success: false, message: "Error fetching categories" });
	}
};

// Add new category
const addCategory = async (req, res) => {
	try {
		console.log("=== ADD CATEGORY REQUEST ===");
		console.log("Request body:", JSON.stringify(req.body, null, 2));
		console.log("Request headers:", req.headers);
		
		const { name, icon } = req.body;

		// Validate input
		if (!name) {
			console.log("❌ Validation failed: name is missing");
			return res.status(400).json({ success: false, message: "Category name is required" });
		}

		if (typeof name !== 'string') {
			console.log("❌ Validation failed: name is not a string");
			return res.status(400).json({ success: false, message: "Category name must be a string" });
		}

		const trimmedName = name.trim();

		if (trimmedName === "") {
			console.log("❌ Validation failed: name is empty after trim");
			return res.status(400).json({ success: false, message: "Category name cannot be empty" });
		}

		console.log("✅ Validation passed. Checking for duplicates...");

		// Check if category already exists (case-insensitive)
		const existingCategory = await categoryModel.findOne({ 
			name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
		});

		if (existingCategory) {
			console.log("❌ Category already exists:", existingCategory);
			return res.status(400).json({ success: false, message: "Category already exists" });
		}

		console.log("✅ No duplicate found. Creating category...");

		const category = new categoryModel({
			name: trimmedName,
			icon: icon || "🍽️",
			isActive: true,
		});

		console.log("Category object created:", category);

		await category.save();
		console.log("✅ Category saved successfully! ID:", category._id);
		console.log("Category data:", JSON.stringify(category, null, 2));
		
		res.json({ success: true, message: "Category added successfully", data: category });
	} catch (error) {
		console.error("❌ ERROR ADDING CATEGORY:");
		console.error("Error type:", error.constructor.name);
		console.error("Error name:", error.name);
		console.error("Error message:", error.message);
		console.error("Error code:", error.code);
		console.error("Error stack:", error.stack);
		
		if (error.errors) {
			console.error("Validation errors:", error.errors);
		}
		
		let errorMessage = "Error adding category";
		
		if (error.name === 'MongoServerError') {
			if (error.code === 11000) {
				errorMessage = "Category name already exists";
			} else {
				errorMessage = `Database error: ${error.message}`;
			}
		} else if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
			errorMessage = `Validation error: ${validationErrors}`;
		} else if (error.name === 'MongoNetworkError' || error.message.includes('connection')) {
			errorMessage = "Database connection error. Please check if MongoDB is running.";
		} else {
			errorMessage = error.message || errorMessage;
		}
		
		res.status(500).json({ success: false, message: errorMessage });
	}
};

// Update category
const updateCategory = async (req, res) => {
	try {
		const { id, name, icon, isActive } = req.body;

		if (!id) {
			return res.json({ success: false, message: "Category ID is required" });
		}

		const updateData = {};
		if (name) updateData.name = name.trim();
		if (icon !== undefined) updateData.icon = icon;
		if (isActive !== undefined) updateData.isActive = isActive;

		const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
		
		if (!category) {
			return res.json({ success: false, message: "Category not found" });
		}

		res.json({ success: true, message: "Category updated successfully", data: category });
	} catch (error) {
		console.error("Error updating category:", error);
		res.json({ success: false, message: error.message || "Error updating category" });
	}
};

// Delete category
const deleteCategory = async (req, res) => {
	try {
		const { id } = req.body;

		if (!id) {
			return res.json({ success: false, message: "Category ID is required" });
		}

		// Check if category is being used by any food items
		const foodModel = (await import("../models/foodModel.js")).default;
		const foodsUsingCategory = await foodModel.countDocuments({ category: (await categoryModel.findById(id))?.name });

		if (foodsUsingCategory > 0) {
			return res.json({ 
				success: false, 
				message: `Cannot delete category. It is being used by ${foodsUsingCategory} food item(s).` 
			});
		}

		await categoryModel.findByIdAndDelete(id);
		res.json({ success: true, message: "Category deleted successfully" });
	} catch (error) {
		console.error("Error deleting category:", error);
		res.json({ success: false, message: error.message || "Error deleting category" });
	}
};

export { getAllCategories, getAllCategoriesAdmin, addCategory, updateCategory, deleteCategory };
