const crypto = require("crypto");

const ENC_SECRET_KEY = process.env.ENC_SECRET_KEY;
const ENC_IV = process.env.ENC_IV;
const ALGORITHM = process.env.ALGORITHM;

function encrypt(text) {
    const iv = Buffer.from(ENC_IV, "hex");
    const key = Buffer.from(ENC_SECRET_KEY, "hex");
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let cipherText = cipher.update(text, "utf8", "hex");
    cipherText += cipher.final("hex");

    return `${iv.toString("hex")}:${cipherText}`;
}

function decrypt(text) {
    const iv = Buffer.from(text.split(":")[0], "hex");
    const key = Buffer.from(ENC_SECRET_KEY, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(text.split(":")[1], "hex", "utf-8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

module.exports = { encrypt, decrypt };
