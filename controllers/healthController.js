// controllers/healthController.js
const mongoose = require("mongoose");

exports.healthCheck = (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  const statusCode = mongoose.connection.readyState === 1 ? 200 : 500;
  res.status(statusCode).json({
    server: "OK",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};
