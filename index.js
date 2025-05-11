require("dotenv").config();
const express = require("express");

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
