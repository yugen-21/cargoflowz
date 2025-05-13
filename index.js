require("dotenv").config();
const express = require("express");
const cors = require("cors");
const allowedOrigins = [
  "https://cargo-flowz-frontend-deploy.vercel.app/",
  "http://localhost:3000", // optional: for local dev
];

// Import authentication routes
const authRoutes = require("./routes/authRoutes");
//Import enquiry routes
const enquiryRoutes = require("./routes/enquiryRoutes");
//Import response routes
const responseRoutes = require("./routes/responseRoutes");
//Import details routes
const detailRoutes = require("./routes/detailsRoutes");

const app = express();
const port = process.env.PORT || 3000;
// ✅ Enable CORS for your frontend
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Parse JSON requests
app.use(express.json());

// Middleware to parse JSON
app.use(express.json());

// Register routes under /api
app.use("/api", authRoutes);
app.use("/api", enquiryRoutes);
app.use("/api", responseRoutes);
app.use("/api", detailRoutes);

// Initialize database and start server
app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
