import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

// ADD FOOD
const addFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!req.file) {
      return res.json({ success: false, message: "Image is required" });
    }

    const food = new foodModel({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: req.file.path, // ✅ Cloudinary URL
    });

    await food.save();
    res.json({ success: true, message: "Food Added Successfully", data: food });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LIST FOOD
const listFood = async (req, res) => {
  const foods = await foodModel.find({});
  res.json({ success: true, data: foods });
};

// REMOVE FOOD
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);

    if (food?.image) {
      const publicId = food.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`a1-cafe/food/${publicId}`);
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// TOGGLE SOLD OUT
const toggleSoldOut = async (req, res) => {
  const food = await foodModel.findById(req.body.id);
  food.soldOut = !food.soldOut;
  await food.save();
  res.json({ success: true, message: "Status updated" });
};

// UPDATE FOOD
const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, category } = req.body;
    const food = await foodModel.findById(id);

    if (req.file && food.image) {
      const publicId = food.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`a1-cafe/food/${publicId}`);
      food.image = req.file.path;
    }

    food.name = name;
    food.description = description;
    food.price = Number(price);
    food.category = category;

    await food.save();
    res.json({ success: true, message: "Food Updated" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { addFood, listFood, removeFood, toggleSoldOut, updateFood };
