import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Get user from token
const getUserFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// add items to user cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId] = 1;
        }
        else{
            cartData[req.body.itemId] += 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Added To Cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
};

// remove items from user cart

const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if(cartData[req.body.itemId] > 0){
            cartData[req.body.itemId] -= 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Removed From Cart"})        

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
};

// fetch user cart data (old format)
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        
        res.json({success:true,cartData})        

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
};

// Get cart by token (new format - returns array)
const getCartByToken = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({ success: false, message: "No token provided" });
        }

        const userId = getUserFromToken(token);
        if (!userId) {
            return res.json({ success: false, message: "Invalid token" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Convert old format object to new array format
        const cartArray = user.cartArray || [];
        res.json({ success: true, cartData: cartArray });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.json({ success: false, message: "Error" });
    }
};

// Update cart by token (new format - accepts array)
const updateCartByToken = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({ success: false, message: "No token provided" });
        }

        const userId = getUserFromToken(token);
        if (!userId) {
            return res.json({ success: false, message: "Invalid token" });
        }

        const { cart } = req.body;
        await userModel.findByIdAndUpdate(userId, { cartArray: cart });
        res.json({ success: true, message: "Cart updated" });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.json({ success: false, message: "Error" });
    }
};

// Clear user cart
const clearCart = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error clearing cart" });
    }
};

export { addToCart, removeFromCart, getCart, clearCart, getCartByToken, updateCartByToken };
