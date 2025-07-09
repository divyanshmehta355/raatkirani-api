// controllers/videoController.js
const fsPromises = require("fs/promises");
const StreamtapeService = require("../services/streamtapeService");

exports.listVideos = async (req, res, next) => {
  try {
    const videos = await StreamtapeService.listVideos();
    res.json({ success: true, videos });
  } catch (err) {
    next(err);
  }
};

exports.getThumbnail = async (req, res, next) => {
  try {
    const url = await StreamtapeService.getThumbnail(req.params.linkId);
    res.json({ success: true, thumbnailUrl: url });
  } catch (err) {
    next(err);
  }
};

exports.getDownloadTicket = async (req, res, next) => {
  try {
    const data = await StreamtapeService.getDownloadTicket(req.params.linkId);
    res.json({ success: true, ticket: data.ticket, wait_time: data.wait_time });
  } catch (err) {
    next(err);
  }
};

exports.getDownloadLink = async (req, res, next) => {
  try {
    const { ticket } = req.query;
    if (!ticket)
      return res
        .status(400)
        .json({ success: false, message: "Ticket required" });
    const result = await StreamtapeService.getDownloadLink(
      req.params.linkId,
      ticket
    );
    res.json({ success: true, downloadUrl: result.url, filename: result.name });
  } catch (err) {
    next(err);
  }
};

exports.uploadVideo = async (req, res, next) => {
  const file = req.file;
  if (!file)
    return res
      .status(400)
      .json({ success: false, message: "No file provided" });

  const localPath = file.path;
  try {
    const result = await StreamtapeService.uploadVideo(
      localPath,
      file.originalname,
      file.mimetype,
      (evt) => {
        const pct = Math.round((evt.loaded * 100) / evt.total);
        console.log(`Upload progress: ${pct}%`);
      }
    );

    res.json({
      success: true,
      data: {
        fileId: result.id,
        fileName: result.name,
        streamUrl: `https://streamtape.com/e/${result.id}`,
        downloadUrl: result.url,
        size: result.size,
        contentType: result.content_type,
        sha256: result.sha256,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    await fsPromises.unlink(localPath).catch(console.error);
  }
};

exports.listRunningConverts = async (req, res, next) => {
  try {
    const converts = await StreamtapeService.listRunningConverts();
    res.json({ success: true, converts });
  } catch (err) {
    next(err);
  }
};

exports.listFailedConverts = async (req, res, next) => {
  try {
    const converts = await StreamtapeService.listFailedConverts();
    res.json({ success: true, converts });
  } catch (err) {
    next(err);
  }
};
