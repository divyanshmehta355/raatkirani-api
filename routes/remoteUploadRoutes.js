const express = require("express");
const router = express.Router();
const remoteUploadController = require("../controllers/remoteUploadController");

router.post("/remote-upload", remoteUploadController.remoteUpload);
router.get(
  "/remote-upload-status/:id",
  remoteUploadController.remoteUploadStatus
);

module.exports = router;
