// middleware/morganConfig.js
const morgan = require("morgan");

// Use 'combined' format for more detailed logs
const morganLogger = morgan("combined");

module.exports = morganLogger;
