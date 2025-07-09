// controllers/remoteUploadController.js
const StreamtapeService = require("../services/streamtapeService");

exports.remoteUpload = async (req, res, next) => {
  const { url, name } = req.body;
  if (!url)
    return res.status(400).json({ success: false, message: "URL is required" });

  try {
    const result = await StreamtapeService.initiateRemoteUpload(url, name);
    res.json({
      success: true,
      remoteUploadId: result.id,
      folderId: result.folderid,
    });
  } catch (err) {
    next(err);
  }
};

exports.remoteUploadStatus = async (req, res, next) => {
  try {
    const status = await StreamtapeService.getRemoteUploadStatus(req.params.id);
    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
};
