// config/multerConfig.js
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Use /tmp directory which is ephemeral on Render
      cb(null, "/tmp/");
    },
    filename: (req, file, cb) => {
      // Generate a unique filename to avoid collisions
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname +
          "-" +
          uniqueSuffix +
          "." +
          file.originalname.split(".").pop()
      );
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 5000, // 5GB limit (Streamtape's max might be higher)
  },
});

module.exports = upload;
