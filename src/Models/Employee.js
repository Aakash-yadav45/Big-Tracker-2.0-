const mongoose = require('mongoose');
const { hashPassword } = require('../Utils/passwordUils');
const moment = require('moment');

const empSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isAdmin: { type: Boolean, default: false },
    isDisable: { type: Boolean, default: false },
    createdAt: { type: String, default: moment().format('YYYY-MM-DD HH:mm:ss') }
});

empSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
    next();
});

module.exports = mongoose.model('Employee', empSchema);
