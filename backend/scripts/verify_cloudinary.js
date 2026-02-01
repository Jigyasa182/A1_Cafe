import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const verify = async () => {
    try {
        console.log("Checking Cloudinary Config...");
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;

        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        console.log(`API Secret: ${apiSecret ? 'Found' : 'Missing'}`);

        if (!apiSecret) {
            console.error("❌ Missing API Secret!");
            return;
        }

        // Try a simple API call (ping)
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary Connection Successful:", result);

    } catch (error) {
        console.error("❌ Cloudinary Connection Failed:", error);
    }
};

verify();
