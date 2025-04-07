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

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, res, next) => {
            next(null, 'public/images');
        },
        filename: (req, file, next) => {            
            next(null, file.mimetype.split('/')[0].toLowerCase() + '_' + randomString() + '_' + Date.now() + path.extname(file.originalname).toLowerCase());
        }
    }),
    limits: { fileSize: 104857600 }
})

module.exports = { upload };