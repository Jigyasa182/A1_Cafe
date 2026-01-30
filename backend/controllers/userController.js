import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import validator from 'validator'

// login user 
const loginUser = async (req, res) => {
    const { name, password } = req.body; // Changed email to name
    try {
        // Find user by name (case-insensitive)
        const user = await userModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (!user) {
            return res.json({ success: false, message: "User Doesn't exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = createToken(user._id);
        res.json({
            success: true, token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Register user 
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        //checking already exists (Check NAME instead of EMAIL for uniqueness)
        const exists = await userModel.findOne({ name });
        if (exists) {
            return res.json({ success: false, message: "Username already taken" })
        }

        //validating email format & string password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'user'
        })

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({
            success: true, token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// List all users
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching users" });
    }
}

export { loginUser, registerUser, listUsers }