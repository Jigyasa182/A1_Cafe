import express from "express";
import {
	getAllCategories,
	getAllCategoriesAdmin,
	addCategory,
	updateCategory,
	deleteCategory,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

// Logging middleware for debugging
categoryRouter.use((req, res, next) => {
	console.log(`[Category Route] ${req.method} ${req.path}`, req.body);
	next();
});

categoryRouter.get("/list", getAllCategories);
categoryRouter.get("/admin/list", getAllCategoriesAdmin);
categoryRouter.post("/add", addCategory);
categoryRouter.post("/update", updateCategory);
categoryRouter.post("/delete", deleteCategory);

// Test endpoint
categoryRouter.get("/test", (req, res) => {
	res.json({ success: true, message: "Category route is working" });
});

export default categoryRouter;
