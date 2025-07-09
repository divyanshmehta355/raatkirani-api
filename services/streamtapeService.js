const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const https = require("https");

const {
  STREAMTAPE_LOGIN,
  STREAMTAPE_KEY,
  STREAMTAPE_FOLDER_ID,
  API_BASE_URL,
} = require("../config/streamtape");

class StreamtapeService {
  static async listVideos() {
    const url = `${API_BASE_URL}/file/listfolder`;
    const resp = await axios.get(url, {
      params: {
        login: STREAMTAPE_LOGIN,
        key: STREAMTAPE_KEY,
        folder: STREAMTAPE_FOLDER_ID,
      },
    });
    if (resp.data.status === 200 && resp.data.result?.files) {
      return resp.data.result.files.filter(
        (f) => f.linkid && f.convert === "converted"
      );
    }
    throw new Error(resp.data.msg || "Failed to list videos");
  }

  static async getThumbnail(linkId) {
    const url = `${API_BASE_URL}/file/getsplash`;
    const resp = await axios.get(url, {
      params: { login: STREAMTAPE_LOGIN, key: STREAMTAPE_KEY, file: linkId },
    });
    if (resp.data.status === 200 && resp.data.result) {
      return resp.data.result;
    }
    throw new Error(resp.data.msg || "Failed to get thumbnail");
  }

  static async getDownloadTicket(linkId) {
    const url = `${API_BASE_URL}/file/dlticket`;
    const resp = await axios.get(url, {
      params: { login: STREAMTAPE_LOGIN, key: STREAMTAPE_KEY, file: linkId },
    });
    if (resp.data.status === 200 && resp.data.result) {
      return resp.data.result;
    }
    throw new Error(resp.data.msg || "Failed to get download ticket");
  }

  static async getDownloadLink(linkId, ticket) {
    const url = `${API_BASE_URL}/file/dl`;
    const resp = await axios.get(url, { params: { file: linkId, ticket } });
    if (resp.data.status === 200 && resp.data.result?.url) {
      return resp.data.result;
    }
    throw new Error(resp.data.msg || "Failed to get download link");
  }

  static async uploadVideo(localPath, originalName, mimeType, onProgress) {
    // Step 1: initiate upload
    const init = await axios.get(`${API_BASE_URL}/file/ul`, {
      params: {
        login: STREAMTAPE_LOGIN,
        key: STREAMTAPE_KEY,
        folder: STREAMTAPE_FOLDER_ID,
      },
      timeout: 60000,
    });
    if (init.data.status !== 200 || !init.data.result?.url) {
      throw new Error(init.data.msg || "Failed to get upload URL");
    }
    const uploadUrl = init.data.result.url;

    // Step 2: stream file
    const stream = fs.createReadStream(localPath);
    const form = new FormData();
    form.append("file1", stream, {
      filename: originalName,
      contentType: mimeType,
    });

    const resp = await axios.post(uploadUrl, form, {
      headers: form.getHeaders(),
      httpsAgent: new https.Agent({ keepAlive: true, family: 4 }),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 600000,
      onUploadProgress: onProgress,
    });

    if (resp.data.status !== 200 || !resp.data.result?.id) {
      throw new Error(resp.data.msg || "Upload failed");
    }
    return resp.data.result;
  }

  static async initiateRemoteUpload(url, name) {
    const resp = await axios.get(`${API_BASE_URL}/remotedl/add`, {
      params: {
        login: STREAMTAPE_LOGIN,
        key: STREAMTAPE_KEY,
        url,
        folder: STREAMTAPE_FOLDER_ID,
        ...(name && { name }),
      },
    });
    if (resp.data.status === 200 && resp.data.result) {
      return resp.data.result;
    }
    throw new Error(resp.data.msg || "Failed to initiate remote upload");
  }

  static async getRemoteUploadStatus(id) {
    const resp = await axios.get(`${API_BASE_URL}/remotedl/status`, {
      params: { login: STREAMTAPE_LOGIN, key: STREAMTAPE_KEY, id },
    });
    if (resp.data.status === 200 && resp.data.result?.[id]) {
      return resp.data.result[id];
    }
    throw new Error(resp.data.msg || "Failed to get remote upload status");
  }

  static async listRunningConverts() {
    const resp = await axios.get(`${API_BASE_URL}/file/runningconverts`, {
      params: { login: STREAMTAPE_LOGIN, key: STREAMTAPE_KEY },
    });
    if (resp.data.status === 200) {
      return resp.data.result;
    }
    throw new Error(resp.data.msg || "Failed to list running converts");
  }

  static async listFailedConverts() {
    const resp = await axios.get(`${API_BASE_URL}/file/failedconverts`, {
      params: { login: STREAMTAPE_LOGIN, key: STREAMTAPE_KEY },
    });
    if (resp.data.status === 200) {
      return resp.data.result;
    }
    throw new Error(resp.data.msg || "Failed to list failed converts");
  }
}

module.exports = StreamtapeService;
