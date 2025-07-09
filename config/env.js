// config/env.js
require("dotenv").config();

const requiredEnv = [
  "PORT",
  "MONGO_URI",
  "STREAMTAPE_LOGIN",
  "STREAMTAPE_KEY",
  "STREAMTAPE_FOLDER_ID",
  // "FRONTEND_URL" is handled dynamically in corsOptions, but good to note
];

function validateEnv() {
  let missing = [];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `CRITICAL ERROR: Missing environment variables: ${missing.join(", ")}`
    );
    console.error(
      "Please ensure these are defined in your .env file or Render's environment settings."
    );
    // In a real production app, you might want to gracefully shut down
    // process.exit(1);
  }

  // Also check for specific Streamtape credentials
  if (
    !process.env.STREAMTAPE_LOGIN ||
    !process.env.STREAMTAPE_KEY ||
    !process.env.STREAMTAPE_FOLDER_ID
  ) {
    console.error(
      "CRITICAL ERROR: Streamtape API credentials (login, key, folder ID) are not fully set in environment variables."
    );
    // process.exit(1);
  }
}

// Export a function to call this when the app starts
module.exports = { validateEnv };
