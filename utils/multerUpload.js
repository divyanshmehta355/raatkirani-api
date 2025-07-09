// utils/multerUpload.js
const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "/tmp/"),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5 GB
});

module.exports = upload;
