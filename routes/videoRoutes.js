// routes/videoRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig"); // Multer config
const { handleLocalFileUpload } = require("../utils/uploadHandler");
const {
  listVideos,
  getVideoThumbnail,
  getDownloadTicket,
  getDownloadLink,
  initiateRemoteUpload,
  getRemoteUploadStatus,
} = require("../utils/streamtapeApi");

// Route: Get all videos from a Streamtape folder
router.get("/videos", async (req, res, next) => {
  try {
    const response = await listVideos();

    if (response.status === 200 && response.result && response.result.files) {
      const videos = response.result.files.filter(
        (file) => file.linkid && file.convert === "converted"
      );
      res.json({ success: true, videos });
    } else {
      console.error("Streamtape API error (listfolder):", response.msg);
      res.status(response.status || 500).json({
        success: false,
        message: response.msg || "Failed to fetch videos.",
      });
    }
  } catch (error) {
    next(error); // Pass to the centralized error handler
  }
});

// Route: Get video thumbnail (splash screen)
router.get("/videos/:linkId/thumbnail", async (req, res, next) => {
  const { linkId } = req.params;
  try {
    const response = await getVideoThumbnail(linkId);

    if (response.status === 200 && response.result) {
      res.json({ success: true, thumbnailUrl: response.result });
    } else {
      console.error(
        `Streamtape API error (getsplash for ${linkId}):`,
        response.msg
      );
      res.status(response.status || 500).json({
        success: false,
        message: response.msg || "Failed to get thumbnail.",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Route: Get a download ticket (first step for direct download)
router.get("/videos/:linkId/download-ticket", async (req, res, next) => {
  const { linkId } = req.params;
  try {
    const response = await getDownloadTicket(linkId);

    if (response.status === 200 && response.result) {
      res.json({
        success: true,
        ticket: response.result.ticket,
        wait_time: response.result.wait_time,
      });
    } else {
      console.error(
        `Streamtape API error (dlticket for ${linkId}):`,
        response.msg
      );
      res.status(response.status || 500).json({
        success: false,
        message: response.msg || "Failed to get download ticket.",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Route: Get the actual download link using the ticket
router.get("/videos/:linkId/download-link", async (req, res, next) => {
  const { linkId } = req.params;
  const { ticket } = req.query; // Ticket passed as query parameter from client

  if (!ticket) {
    return res
      .status(400)
      .json({ success: false, message: "Download ticket is required." });
  }

  try {
    const response = await getDownloadLink(linkId, ticket);

    if (response.status === 200 && response.result && response.result.url) {
      res.json({
        success: true,
        downloadUrl: response.result.url,
        filename: response.result.name,
      });
    } else {
      console.error(`Streamtape API error (dl for ${linkId}):`, response.msg);
      res.status(response.status || 500).json({
        success: false,
        message: response.msg || "Failed to get download link.",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Local File Upload Route
router.post("/upload", upload.single("videoFile"), handleLocalFileUpload);

// Remote Upload Endpoint
router.post("/remote-upload", async (req, res, next) => {
  const { url, name } = req.body;

  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: "Remote URL is required." });
  }

  try {
    const response = await initiateRemoteUpload(url, name);

    if (response.status === 200 && response.result) {
      console.log(
        `Remote upload initiated for URL: ${url}. Streamtape ID: ${response.result.id}`
      );
      res.status(200).json({
        success: true,
        message: "Remote upload initiated successfully.",
        remoteUploadId: response.result.id,
        folderId: response.result.folderid,
      });
    } else {
      console.error("Streamtape Remote DL API error (add):", response.msg);
      res.status(response.status || 500).json({
        success: false,
        message: response.msg || "Failed to initiate remote upload.",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Check Remote Upload Status Endpoint
router.get("/remote-upload-status/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const response = await getRemoteUploadStatus(id);

    if (response.status === 200 && response.result && response.result[id]) {
      console.log(
        `Remote upload status for ID ${id}: ${response.result[id].status}`
      );
      res.status(200).json({
        success: true,
        status: response.result[id].status,
        bytesLoaded: response.result[id].bytes_loaded,
        bytesTotal: response.result[id].bytes_total,
        remoteUrl: response.result[id].remoteurl,
        streamtapeUrl: response.result[id].url,
      });
    } else if (
      response.status === 200 &&
      response.result &&
      !response.result[id]
    ) {
      console.warn(`Remote upload ID ${id} not found or no status available.`);
      res.status(404).json({
        success: false,
        message: "Remote upload ID not found or status not yet available.",
      });
    } else {
      console.error("Streamtape Remote DL API error (status):", response.msg);
      res.status(response.status || 500).json({
        success: false,
        message: response.msg || "Failed to retrieve remote upload status.",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
