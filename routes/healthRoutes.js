// routes/healthRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Health Check Endpoint
router.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbMessage = dbStatus === 1 ? "Connected" : "Disconnected";
  const serverStatus = "OK";

  if (dbStatus === 1) {
    res.status(200).json({
      server: serverStatus,
      database: dbMessage,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(500).json({
      server: serverStatus,
      database: dbMessage,
      timestamp: new Date().toISOString(),
      error: "Database connection is not healthy",
    });
  }
});

module.exports = router;
