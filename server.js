// server.js
const express = require("express");
const cors = require("cors");
const expressStatusMonitor = require("express-status-monitor");

// Modular Imports
const { validateEnv } = require("./config/env");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./db/connection");
const morganLogger = require("./middleware/morganConfig");
const errorHandler = require("./middleware/errorHandler");
const videoRoutes = require("./routes/videoRoutes");
const healthRoutes = require("./routes/healthRoutes");

// Validate environment variables first
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Express Status Monitor
app.use(expressStatusMonitor());

// Essential Middleware
app.use(morganLogger); // Request Logging
app.use(cors(corsOptions)); // CORS
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests

// MongoDB Connection
connectDB();

// API Routes
app.use("/api", videoRoutes); // All video-related routes are prefixed with /api
app.use("/", healthRoutes); // Health check at root or /health

// Basic Welcome Route
app.get("/", (req, res) => {
  res.send("Raat Ki Rani Backend API is running!");
});

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

// Start the Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Local API Access: http://localhost:${PORT}/api/videos`);
    console.log(`Local Upload Endpoint: http://localhost:${PORT}/api/upload`);
    console.log(`Local Health Check: http://localhost:${PORT}/health`);
    console.log(`Express Monitor Dashboard: http://localhost:${PORT}/status`);
  } else {
    console.log("Server is running in production mode.");
  }
});

// Increase server's default timeout (e.g., 5 minutes) for large uploads
server.timeout = 300000; // 5 minutes (in milliseconds)

// Centralized Error Logging for Uncaught Exceptions and Unhandled Rejections
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 🚨 Shutting down...");
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION! 🚨 Shutting down...");
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  server.close(() => {
    process.exit(1);
  });
});
