const multer = require('multer');
const path = require('path');

function randomString() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = "";
    for (let i = 1; i <= 5; i++) {
        str += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return str;
}

const storage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, 'public/audio'); // Store in 'public/audio' folder
    },
    filename: (req, file, next) => {
        next(null, 'audio_' + randomString() + '_' + Date.now() + path.extname(file.originalname).toLowerCase());
    }
});

const fileFilter = (req, file, next) => {
    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-wav'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        next(null, true);
    } else {
        next(new Error('Only audio files are allowed!'), false);
    }
};

const uploadAudio = multer({
    storage,
    limits: { fileSize: 104857600 }, // 100MB limit
    fileFilter
});

module.exports = { uploadAudio };
