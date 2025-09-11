const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const config = require("./config/config.json");
const { commonResponse } = require("./api/v1/common/common");
const { connectDB, closeDB } = require("./config/db"); 
const path = require("path");

require("dotenv").config();

const corsOptions = {
  origin: [
    config.frontend,
  ],
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
  credentials: true
};

app.use("/uploads", express.static(path.join(__dirname, "api/v1/uploads")));

// Enables CORS for requests
app.use(cors(corsOptions));

// Set size limit for JSON and URL-encoded payloads to 20MB
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Parse requests of content-type - application/json
app.use(express.json());
// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Set Allowed HTTP headers for cross-origin requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Use the cookie-parser middleware
app.use(cookieParser());

// Health check endpoint (added for monitoring)
app.get("/health", (req, res) => {
  commonResponse(res, 200, { 
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple route
app.get("/", (req, res) => {
  commonResponse(res, 200, { message: "Hello from Jawal Games" });
});

// routes
require("./api/v1/routes/auth.routes")(app);
require("./api/v1/routes/game.routes")(app);
require("./api/v1/routes/nav.routes")(app);
require("./api/v1/routes/footer.routes")(app);
require("./api/v1/routes/count.routes")(app);

// Global error handler (added for better error management)
app.use((error, req, res, next) => {
  commonResponse(res, error.status || 500, {
    error: {
      message: error.message || 'Internal server error',
      status: error.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

// Handle 404 (added for better API responses)
app.use('*', (req, res) => {
  commonResponse(res, 404, {
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('***Starting server initialization...');
    
    // Connect to MySQL and auto-create tables
    await connectDB(); 

    // Set port, listen for requests
    const PORT = config.serverPort || 3000;
    app.listen(PORT, () => {
      console.log(`*Server is running on port ${PORT}`);
      console.log(`*Health check: http://localhost:${PORT}/health`);
      console.log(`*Jawal Games API: http://localhost:${PORT}`);
      console.log(`*Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handlers (added for production stability)
process.on('SIGTERM', async () => {
  console.log('(: SIGTERM received, shutting down gracefully...');
  try {
    await closeDB();
    console.log(' (: Database connections closed');
  } catch (error) {
    console.error('): Error closing database:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('): SIGINT received, shutting down gracefully...');
  try {
    await closeDB();
    console.log('(: Database connections closed');
  } catch (error) {
    console.error('): Error closing database:', error);
  }
  process.exit(0);
});

// Handle uncaught exceptions (added for production stability)
process.on('uncaughtException', (error) => {
  console.error('): Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections (added for production stability)
process.on('unhandledRejection', (reason, promise) => {
  console.error('): Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server with database initialization
startServer();

module.exports = app;