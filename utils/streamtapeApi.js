// utils/streamtapeApi.js
const axios = require("axios");
const https = require("https"); // Needed for httpsAgent in axios

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY;
const STREAMTAPE_FOLDER_ID = process.env.STREAMTAPE_FOLDER_ID;
const API_BASE_URL = "https://api.streamtape.com";

// Optional: Force IPv4 for axios if you previously had issues
const httpsAgent = new https.Agent({
  keepAlive: true,
  family: 4,
});

const getStreamtapeParams = () => ({
  login: STREAMTAPE_LOGIN,
  key: STREAMTAPE_KEY,
});

const listVideos = async () => {
  const url = `${API_BASE_URL}/file/listfolder`;
  const params = {
    ...getStreamtapeParams(),
    folder: STREAMTAPE_FOLDER_ID,
  };
  const response = await axios.get(url, { params });
  return response.data;
};

const getVideoThumbnail = async (linkId) => {
  const url = `${API_BASE_URL}/file/getsplash`;
  const params = {
    ...getStreamtapeParams(),
    file: linkId,
  };
  const response = await axios.get(url, { params });
  return response.data;
};

const getDownloadTicket = async (linkId) => {
  const url = `${API_BASE_URL}/file/dlticket`;
  const params = {
    ...getStreamtapeParams(),
    file: linkId,
  };
  const response = await axios.get(url, { params });
  return response.data;
};

const getDownloadLink = async (linkId, ticket) => {
  const url = `${API_BASE_URL}/file/dl`;
  const params = {
    file: linkId,
    ticket: ticket,
  };
  const response = await axios.get(url, { params });
  return response.data;
};

const getUploadUrl = async () => {
  const url = `${API_BASE_URL}/file/ul`;
  const params = {
    ...getStreamtapeParams(),
    folder: STREAMTAPE_FOLDER_ID,
  };
  const response = await axios.get(url, { params, timeout: 60000 }); // 1 minute timeout
  return response.data;
};

const uploadFileToStreamtape = async (uploadUrl, formData, fileName) => {
  const response = await axios.post(uploadUrl, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    httpsAgent: httpsAgent,
    timeout: 600000, // 10 minutes timeout for actual upload
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (percentCompleted % 10 === 0 || percentCompleted === 100) {
        console.log(`Upload progress for ${fileName}: ${percentCompleted}%`);
      }
    },
  });
  return response.data;
};

const initiateRemoteUpload = async (url, name) => {
  const streamtapeRemoteDlUrl = `${API_BASE_URL}/remotedl/add`;
  const params = {
    ...getStreamtapeParams(),
    url: url,
    folder: STREAMTAPE_FOLDER_ID,
  };

  if (name) {
    params.name = name;
  }

  const response = await axios.get(streamtapeRemoteDlUrl, { params });
  return response.data;
};

const getRemoteUploadStatus = async (id) => {
  const streamtapeRemoteDlStatusUrl = `${API_BASE_URL}/remotedl/status`;
  const params = {
    ...getStreamtapeParams(),
    id: id,
  };
  const response = await axios.get(streamtapeRemoteDlStatusUrl, { params });
  return response.data;
};

const listRunningConverts = async () => {
  const url = `${API_BASE_URL}/file/runningconverts`;
  const params = getStreamtapeParams(); // No folder ID needed for this endpoint
  const response = await axios.get(url, { params });
  return response.data;
};

const listFailedConverts = async () => {
  const url = `${API_BASE_URL}/file/failedconverts`;
  const params = getStreamtapeParams(); // No folder ID needed for this endpoint
  const response = await axios.get(url, { params });
  return response.data;
};

module.exports = {
  listVideos,
  getVideoThumbnail,
  getDownloadTicket,
  getDownloadLink,
  getUploadUrl,
  uploadFileToStreamtape,
  initiateRemoteUpload,
  getRemoteUploadStatus,
  listRunningConverts,
  listFailedConverts,
};
