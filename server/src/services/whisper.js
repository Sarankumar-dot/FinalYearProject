const OpenAI = require('openai');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Transcribes an audio/video buffer using OpenAI Whisper API.
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Transcript text
 */
async function transcribeAudio(buffer, filename, mimeType) {
  if (!process.env.OPENAI_API_KEY) {
    return '[OpenAI API key not configured — transcription unavailable]';
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Write buffer to a temp file (Whisper API requires a file)
  const ext = path.extname(filename) || '.mp4';
  const tmpFile = path.join(os.tmpdir(), `whisper_${Date.now()}${ext}`);
  fs.writeFileSync(tmpFile, buffer);

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-1',
      response_format: 'text',
    });
    return typeof response === 'string' ? response : response.text;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

module.exports = { transcribeAudio };
