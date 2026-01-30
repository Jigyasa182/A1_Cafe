import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import tableRouter from "./routes/tableRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import "dotenv/config";

import { createServer } from "http";
import { Server } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";

/* ---------------- BASIC SETUP ---------------- */

const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;

/* ---------------- ALLOWED ORIGINS ---------------- */

const allowedOrigins = [
  "https://a1-cafe.onrender.com",
  "http://localhost:5173"
];

/* ---------------- SOCKET.IO ---------------- */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* ---------------- PATH SETUP (ES MODULES) ---------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ---------------- CORS (ONLY ONCE) ---------------- */

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true
  })
);

/* ---------------- STATIC FILES ---------------- */

app.use(
  "/images",
  express.static(uploadsPath, {
    maxAge: "1d",
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigins.join(","));
      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  })
);

/* ---------------- DATABASE ---------------- */

connectDB();

/* ---------------- SOCKET ACCESS IN ROUTES ---------------- */

app.set("io", io);

/* ---------------- API ROUTES ---------------- */

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/table", tableRouter);
app.use("/api/category", categoryRouter);

/* ---------------- ROOT TEST ---------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Working",
    time: new Date().toISOString()
  });
});

/* ---------------- SOCKET EVENTS ---------------- */

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ---------------- START SERVER ---------------- */

server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log("📡 Socket.IO ready");
});
