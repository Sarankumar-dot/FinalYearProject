const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/lessons", require("./routes/lessons"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/quizzes", require("./routes/quizzes"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/users", require("./routes/users"));
app.use("/api/signlang", require("./routes/signlang"));
app.use("/api/signdict", require("./routes/signdict"));
app.use("/api/documents", require("./routes/documents"));

app.get("/", (req, res) =>
  res.json({ message: "Bridging the Gap API is running ✅" }),
);
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: "local JSON storage",
    mode: "demo",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// Start server directly — no MongoDB needed
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Data stored in: server/data/ (local JSON files)`);
  console.log(`🌐 API: http://localhost:${PORT}`);
});

module.exports = app;
