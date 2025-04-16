const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination folder exists
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Utility to generate a random string
function randomString(length = 5) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AUDIO_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `audio_${randomString()}_${Date.now()}${ext}`;
        cb(null, name);
    }
});

// Accepted audio MIME types
const allowedMimeTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp3'
];

// File filter for audio validation
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.warn(`Rejected file with type: ${file.mimetype}`);
        cb(new Error('Only supported audio formats are allowed!'), false);
    }
};

// Export multer config
const uploadAudio = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter
});

module.exports = { uploadAudio };
