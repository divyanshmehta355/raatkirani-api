const app = require("./app");
const http = require("http");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.timeout = 300000; // 5 minutes

// Graceful Shutdown
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 🚨", err);
  server.close(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION! 🚨", reason);
  server.close(() => process.exit(1));
});
