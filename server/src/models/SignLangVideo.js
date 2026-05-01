const mongoose = require('mongoose');

const signLangVideoSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true, lowercase: true, trim: true },
  videoUrl: { type: String, required: true },       // YouTube embed or Cloudinary URL
  description: { type: String, default: '' },
  subject: { type: String, default: 'General' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

signLangVideoSchema.index({ keyword: 'text' });

module.exports = mongoose.model('SignLangVideo', signLangVideoSchema);
