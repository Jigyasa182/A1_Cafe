import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import 'dotenv/config'
import userModel from "../models/userModel.js";
import { connectDB } from "../config/db.js";

const createDemoUser = async () => {
    try {
        await connectDB();

        // Check if demo user already exists
        const userExists = await userModel.findOne({ email: 'user@cafe.com' });
        if (userExists) {
            console.log('✅ Demo user already exists');
            process.exit(0);
        }

        // Create demo user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('user@123', salt);

        const newUser = new userModel({
            name: 'Demo User',
            email: 'user@cafe.com',
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();
        console.log('✅ Demo user created successfully');
        console.log('Email: user@cafe.com');
        console.log('Password: user@123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating demo user:', error);
        process.exit(1);
    }
};

createDemoUser();
