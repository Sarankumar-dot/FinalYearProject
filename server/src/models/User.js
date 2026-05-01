const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const accessibilityPrefsSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'high-contrast'], default: 'dark' },
  fontSize: { type: String, enum: ['small', 'medium', 'large', 'xlarge'], default: 'medium' },
  ttsSpeed: { type: Number, min: 0.5, max: 2.0, default: 1.0 },
  captionSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  captionColour: { type: String, default: '#FFFFFF' },
  captionBg: { type: String, default: 'rgba(0,0,0,0.75)' },
  keyboardNavMode: { type: Boolean, default: false },
  autoPlayTTS: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  accessibilityType: { type: String, enum: ['standard', 'visually-impaired', 'hearing-impaired'], default: 'standard' },
  accessibilityPrefs: { type: accessibilityPrefsSchema, default: () => ({}) },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Remove passwordHash from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
