// db/connection.js
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // In production, you might want to exit if DB connection fails critical
    // process.exit(1);
  }
};

module.exports = connectDB;

// If you decide to use the Mongoose Schema later:
/*
// db/models/videoModel.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    fileId: { type: String, required: true, unique: true },
    fileName: String,
    streamUrl: String,
    downloadUrl: String,
    size: Number,
    contentType: String,
    uploadedAt: { type: Date, default: Date.now },
    // Add more fields as needed (e.g., views, likes, description, tags)
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
*/
