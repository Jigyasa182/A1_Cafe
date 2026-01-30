import foodModel from "../models/foodModel.js";
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '../uploads');

//add food item 
const addFood = async (req,res) => {
    try {
        console.log("Add food request received:", {
            body: req.body,
            hasFile: !!req.file,
            fileName: req.file?.filename,
            filePath: req.file?.path
        });

        // Validate required fields
        if (!req.body.name || !req.body.description || !req.body.price || !req.body.category) {
            console.log("Validation failed: Missing required fields");
            return res.json({success:false, message:"All fields are required"});
        }

        // Check if image is uploaded
        if (!req.file) {
            console.log("Validation failed: No image file");
            return res.json({success:false, message:"Image is required"});
        }

        const image_filename = req.file.filename;
        const food = new foodModel({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            price: Number(req.body.price),
            category: req.body.category,
            image: image_filename
        });
        
        await food.save();
        console.log("✅ Food item saved successfully:", food._id);
        console.log("📁 Image file saved at:", req.file.path);
        res.json({success:true, message:"Food Added Successfully"});
    } catch (error) {
        console.error("❌ Error adding food - Full error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        // If file was uploaded but save failed, delete the file
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting uploaded file:", err);
            });
        }
        
        // Provide more specific error messages
        let errorMessage = "Error adding food item";
        if (error.name === 'ValidationError') {
            errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
        } else if (error.name === 'MongoServerError') {
            errorMessage = "Database error. Please try again.";
        } else {
            errorMessage = error.message || errorMessage;
        }
        
        res.status(500).json({success:false, message: errorMessage});
    }
}


// all food list

const listFood = async(req,res)=>{
    try {
        const foods = await foodModel.find({});
        res.json({success:true, data:foods});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// remove food item 

const removeFood = async(req,res) =>{
    try {
        const food = await foodModel.findById(req.body.id);
        const filePath = path.join(uploadsPath, food.image);
        
        // Delete file with proper error handling
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting image file:", err);
            else console.log("✅ Image file deleted:", filePath);
        });

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Food Removed"})
    } catch (error) {
        console.log("❌ Error removing food:", error);
        res.json({success:false,message:"Error"})
    }
}

// toggle sold out
const toggleSoldOut = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        food.soldOut = !food.soldOut;
        await food.save();
        res.json({ success: true, message: "Sold out status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating sold out status" });
    }
}

// update food item
const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category } = req.body;
        const updateData = { 
            name, 
            description, 
            price: Number(price), 
            category 
        };
        
        if (req.file) {
            // Delete old image
            const oldFood = await foodModel.findById(id);
            if (oldFood && oldFood.image) {
                const oldFilePath = path.join(uploadsPath, oldFood.image);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                    else console.log("✅ Old image deleted:", oldFilePath);
                });
            }
            updateData.image = req.file.filename;
        }
        
        await foodModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Food item updated" });
    } catch (error) {
        console.error("❌ Error updating food item:", error);
        res.json({ success: false, message: "Error updating food item" });
    }
}

export {addFood,listFood,removeFood, toggleSoldOut, updateFood};
