// config/corsOptions.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL] // Render will inject FRONTEND_URL.
        : ["http://localhost:3000", "http://localhost:5173"]; // Next.js default is 3000

    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow necessary HTTP methods
  credentials: true, // Allow cookies to be sent (if you add authentication later)
  allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
};

module.exports = corsOptions;
