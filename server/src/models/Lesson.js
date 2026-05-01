const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, default: 'General' },
  type: {
    type: String,
    enum: ['video', 'audio', 'pdf', 'text', 'image'],
    required: true,
  },
  fileUrl: { type: String, default: '' },          // Cloudinary URL
  thumbnailUrl: { type: String, default: '' },
  transcript: { type: String, default: '' },       // Auto-generated from STT
  altText: { type: String, default: '' },          // For image lessons
  textContent: { type: String, default: '' },      // For text-type lessons
  tags: [{ type: String, trim: true }],            // Used for sign lang lookup
  duration: { type: Number, default: 0 },          // seconds (for video/audio)
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  signLangVideos: [{
    keyword: String,
    videoUrl: String,
  }],
}, { timestamps: true });

lessonSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Lesson', lessonSchema);
