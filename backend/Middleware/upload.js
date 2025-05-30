// src/middleware/upload.js
const path   = require('path');
const multer = require('multer');
const crypto = require('crypto');

// Accept only images or audio
const fileFilter = (_req, file, cb) => {
  const mime = file.mimetype;
  if (mime.startsWith('image/') || mime.startsWith('audio/')) return cb(null, true);
  return cb(new Error('Only image or audio files are allowed'));
};

// Generate unique filename: <timestamp>-<random>.<ext>
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

module.exports = multer({ storage, fileFilter });
