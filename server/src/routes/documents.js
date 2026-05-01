const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { createStore } = require("../db");

// Persistent JSON file store: server/data/documents.json
const memDocuments = createStore("documents");

// Ensure documents directory exists
const uploadDir = path.join(__dirname, "../..", "uploads", "documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf" || ext === ".txt") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed."), false);
    }
  },
});

router.post(
  "/upload",
  auth,
  requireRole("teacher", "admin"),
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Please provide an allowed file (PDF or TXT)" });
      }

      const id = String(Date.now());
      const newDocument = {
        _id: id,
        id: id,
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        fileUrl: `/uploads/documents/${req.file.filename}`,
        fileName: req.file.originalname,
        uploadedBy: req.user._id,
        uploadedByName: req.user.name,
        createdAt: new Date().toISOString(),
      };

      memDocuments.set(id, newDocument);
      res.json(newDocument);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

router.get("/", auth, async (req, res) => {
  try {
    const list = memDocuments
      .toArray()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Endpoint to extract raw text (support for Text-to-Speech)
router.get("/extract-text", auth, async (req, res) => {
  try {
    const docUrl = req.query.url;
    if (!docUrl)
      return res.status(400).json({ message: "No document URL provided" });

    // Create absolute path based on the root of the server directory
    const serverRoot = path.join(__dirname, "../..");
    // E.g., docUrl is '/uploads/documents/170000-file.pdf'
    // Let's strip the leading slash if it exists so path.join works predictably
    const relativeUrl = docUrl.startsWith("/") ? docUrl.substring(1) : docUrl;
    const filePath = path.join(serverRoot, relativeUrl);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(serverRoot)) {
      return res.status(403).json({ message: "Invalid path" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".txt") {
      const text = fs.readFileSync(filePath, "utf8");
      return res.send(text);
    } else if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return res.send(data.text);
    } else {
      return res
        .status(400)
        .json({ message: "Unsupported file type for reading" });
    }
  } catch (err) {
    console.error("Text extraction error:", err.message);
    res.status(500).json({ message: "Failed to extract text from document" });
  }
});

router.delete(
  "/:id",
  auth,
  requireRole("teacher", "admin"),
  async (req, res) => {
    try {
      const document = memDocuments.get(req.params.id);
      if (!document)
        return res.status(404).json({ message: "Document not found" });

      if (req.user.role !== "admin" && document.uploadedBy !== req.user._id) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this document" });
      }

      const filePath = path.join(__dirname, "../..", document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      memDocuments.delete(req.params.id);
      res.json({ message: "Document removed" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

module.exports = router;
