import express from "express";
import upload from "../middleware/upload.js";
import {
  addFood,
  listFood,
  removeFood,
  toggleSoldOut,
  updateFood,
} from "../controllers/foodController.js";

const foodRouter = express.Router();

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/toggle-sold-out", toggleSoldOut);
foodRouter.post("/update", upload.single("image"), updateFood);

export default foodRouter;
