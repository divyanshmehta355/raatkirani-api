// utils/uploadHandler.js
const fs = require("fs");
const fsPromises = require("fs/promises");
const FormData = require("form-data");
const { getUploadUrl, uploadFileToStreamtape } = require("./streamtapeApi");

const handleLocalFileUpload = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No video file provided." });
  }

  const tempFilePath = req.file.path; // Path to the temporarily saved file
  const originalFileName = req.file.originalname;

  try {
    // Step 1: Get an upload URL from Streamtape
    const initResponse = await getUploadUrl();

    if (initResponse.status !== 200 || !initResponse.result?.url) {
      throw new Error(
        initResponse.msg || "Failed to get upload URL from Streamtape."
      );
    }

    const uploadUrl = initResponse.result.url;
    console.log(
      `Streamtape upload URL obtained for ${originalFileName}: ${uploadUrl}`
    );

    // Step 2: Create a readable stream from the temporary file
    const fileReadStream = fs.createReadStream(tempFilePath);

    const form = new FormData();
    form.append("file1", fileReadStream, {
      filename: originalFileName,
      contentType: req.file.mimetype || "application/octet-stream",
    });

    // Step 3: Perform the actual upload to Streamtape by piping the file stream
    const uploadResponse = await uploadFileToStreamtape(
      uploadUrl,
      form,
      originalFileName
    );

    if (uploadResponse.status !== 200 || !uploadResponse.result?.id) {
      throw new Error(
        uploadResponse.msg ||
          "Upload failed or no file ID returned from Streamtape."
      );
    }

    const result = uploadResponse.result;
    console.log(
      `File ${originalFileName} uploaded to Streamtape with ID: ${result.id}`
    );

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully!",
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
  } finally {
    // Ensure the temporary file is deleted, regardless of success or failure
    if (tempFilePath) {
      await fsPromises
        .unlink(tempFilePath)
        .then(() => console.log(`Temporary file deleted: ${tempFilePath}`))
        .catch((unlinkError) =>
          console.error(
            `Error deleting temporary file ${tempFilePath}:`,
            unlinkError
          )
        );
    }
  }
};

module.exports = { handleLocalFileUpload };
