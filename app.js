require("dotenv").config();
const express = require("express");
const corsMiddleware = require("./middleware/cors");
const morgan = require("morgan");
const expressStatusMonitor = require("express-status-monitor");

const videoRoutes = require("./routes/videoRoutes");
const remoteUploadRoutes = require("./routes/remoteUploadRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Middleware
app.use(expressStatusMonitor());
app.use(morgan("combined"));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Routes
app.use("/api", videoRoutes);
app.use("/api", remoteUploadRoutes);
app.use("/", healthRoutes);

module.exports = app;
