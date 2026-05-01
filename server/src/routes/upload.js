const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Try to set up multer (for local file saving)
let multerUpload = null;
const path = require('path');
const fs = require('fs');

try {
  const multer = require('multer');
  // Save uploaded files to server/uploads/ folder
  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname));
    },
  });
  multerUpload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
} catch (_) {}

// POST /api/upload — create a lesson (URL-based OR file upload)
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  const processRequest = async () => {
    const { title, description, subject, altText, textContent, tags, type, fileUrl: bodyUrl } = req.body;

    if (!title) return res.status(400).json({ message: 'Lesson title is required.' });
    if (!description || description.trim() === '') return res.status(400).json({ message: 'Lesson description is required.' });

    const lessonType = type || 'text';
    let fileUrl = bodyUrl || '';
    let transcript = req.body.transcript || '';

    // If a file was uploaded locally, serve it via a static URL
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      
      // Auto-generate transcript for video/audio if not provided
      if (!transcript && (lessonType === 'video' || lessonType === 'audio')) {
        try {
          const { transcribeAudio } = require('../services/whisper');
          const fs = require('fs');
          const buffer = fs.readFileSync(req.file.path);
          transcript = await transcribeAudio(buffer, req.file.originalname, req.file.mimetype);
        } catch (err) {
          console.error('Whisper auto-transcription failed:', err.message);
        }
      }
    }

    const lessonData = {
      title,
      description: description || '',
      subject: subject || 'General',
      type: lessonType,
      fileUrl,
      thumbnailUrl: '',
      transcript,
      altText: altText || '',
      textContent: textContent || '',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)) : [],
      teacherId: req.user._id,
      isPublished: true,
    };

    // Store in persistent lesson store
    const { memLessons } = require('./lessons');
    const id = String(Date.now());
    const lesson = { _id: id, id, ...lessonData, viewCount: 0, createdAt: new Date().toISOString() };
    memLessons.set(id, lesson);
    res.status(201).json({ lesson });
  };

  if (multerUpload) {
    multerUpload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      processRequest().catch(e => res.status(500).json({ message: e.message }));
    });
  } else {
    processRequest().catch(e => res.status(500).json({ message: e.message }));
  }
});

module.exports = router;
