import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import tableRouter from "./routes/tableRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';



//app config
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*", // Allow all origins for now, adjust as needed
		methods: ["GET", "POST", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "token"]
	}
});
const port = process.env.PORT || 4000;

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, 'uploads');

//middleware 
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - must be before routes
// Handle ALL preflight OPTIONS requests first
app.use((req, res, next) => {
	// Set CORS headers for all requests
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token, Token');
	
	// Handle preflight requests
	if (req.method === 'OPTIONS') {
		console.log('✅ Handling OPTIONS preflight request');
		return res.status(200).end();
	}
	next();
});

app.use(cors({
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "token", "Token", "x-requested-with", "Origin", "X-Requested-With", "Accept"],
	credentials: false,
	preflightContinue: false,
	optionsSuccessStatus: 200
}));

// Serve static files (images) - MUST be before API routes
app.use("/images", express.static(uploadsPath, {
	maxAge: '1d',
	etag: false,
	setHeaders: (res, path) => {
		res.setHeader('Cache-Control', 'public, max-age=86400');
		res.setHeader('Access-Control-Allow-Origin', '*');
	}
}));

// db connection 
connectDB();

// Make io accessible in routes (must be before routes)
app.set('io', io);
app.set('socketio', io);

// Test route to verify io is accessible
app.get('/test-socket', (req, res) => {
	const io = req.app.get('io');
	if (io) {
		res.json({ success: true, message: "Socket.io is accessible", connectedClients: io.sockets.sockets.size });
	} else {
		res.json({ success: false, message: "Socket.io is not accessible" });
	}
});

// api endpoints
app.use("/api/food",foodRouter)
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/table",tableRouter)
app.use("/api/category",categoryRouter)

app.get("/", (req,res)=>{
    console.log("✅ Root endpoint hit");
    res.json({ 
        success: true, 
        message: "API Working",
        timestamp: new Date().toISOString(),
        endpoints: {
            food: "/api/food",
            order: "/api/order",
            user: "/api/user",
            cart: "/api/cart",
            category: "/api/category"
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

// Socket.io connection
io.on('connection', (socket) => {
	console.log('✅ User connected:', socket.id);

	socket.on('disconnect', () => {
		console.log('❌ User disconnected:', socket.id);
	});

	// Handle errors
	socket.on('error', (error) => {
		console.error('Socket error:', error);
	});
});

// Log socket.io status
console.log('📡 Socket.io initialized and ready');

server.listen(port, '0.0.0.0', ()=>{
    console.log(`✅ Server started on port ${port}`)
    console.log(`📡 Socket.io ready for connections`)
})


