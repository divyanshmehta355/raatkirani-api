const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");

router.get("/health", healthController.healthCheck);
router.get("/", (req, res) =>
  res.send("Seductive Streams Backend API is running!")
);

module.exports = router;
