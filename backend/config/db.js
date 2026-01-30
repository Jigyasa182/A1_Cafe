import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		// 1️⃣ Validate environment variable
		const MONGO_URI = process.env.MONGO_URI;

		if (!MONGO_URI) {
			throw new Error("MONGO_URI is not defined in environment variables");
		}

		// 2️⃣ Connect to MongoDB Atlas
		const conn = await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

		console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

		// 3️⃣ SAFE index cleanup (only if collection exists)
		try {
			const db = mongoose.connection.db;
			const collections = await db.listCollections({ name: "tables" }).toArray();

			if (collections.length > 0) {
				const tableCollection = db.collection("tables");

				// Drop only the problematic index if it exists
				await tableCollection.dropIndex("tableNumber_1_type_1").catch(() => {});
				await tableCollection.dropIndex("tableId_1").catch(() => {});
				console.log("🧹 Table indexes checked (safe)");
			}
		} catch (indexErr) {
			console.log("ℹ️ Index cleanup skipped (not required)");
		}

	} catch (error) {
		console.error("❌ MongoDB Connection Failed");
		console.error("Reason:", error.message);

		// ❗ Fail fast – do NOT retry blindly
		process.exit(1);
	}
};
