import express from "express";
import {
	addFood,
	listFood,
	removeFood,
	toggleSoldOut,
	updateFood,
} from "../controllers/foodController.js";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';

const foodRouter = express.Router();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '../uploads');

// image storage engine
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsPath);
	},
	filename: (req, file, cb) => {
		// Sanitize filename and add timestamp
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
		cb(null, `${uniqueSuffix}-${sanitizedName}`);
	},
});

const upload = multer({ 
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		// Accept images only
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'), false);
		}
	}
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
	if (err) {
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ success: false, message: 'File size too large. Maximum 5MB allowed.' });
			}
			return res.status(400).json({ success: false, message: err.message });
		}
		// Handle other multer errors (like fileFilter errors)
		return res.status(400).json({ success: false, message: err.message || 'File upload error' });
	}
	next();
};

foodRouter.post("/add", (req, res, next) => {
	upload.single("image")(req, res, (err) => {
		if (err) {
			return handleMulterError(err, req, res, next);
		}
		next();
	});
}, addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/toggle-sold-out", toggleSoldOut);
foodRouter.post("/update", upload.single("image"), updateFood);

export default foodRouter;
