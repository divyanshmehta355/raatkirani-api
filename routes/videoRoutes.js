const express = require("express");
const router = express.Router();
const multer = require("../utils/multerUpload");
const videoController = require("../controllers/videoController");

router.get("/videos", videoController.listVideos);
router.get("/videos/:linkId/thumbnail", videoController.getThumbnail);
router.get(
  "/videos/:linkId/download-ticket",
  videoController.getDownloadTicket
);
router.get("/videos/:linkId/download-link", videoController.getDownloadLink);
router.post("/upload", multer.single("videoFile"), videoController.uploadVideo);

router.get("/converts/running", videoController.listRunningConverts);
router.get("/converts/failed", videoController.listFailedConverts);

module.exports = router;
