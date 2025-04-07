const mongoose = require('mongoose');

const url = process.env.MONGO_URL;
console.log('url:- ', url);

const connectDB = async () => {
    try {
        await mongoose.connect(url);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.log('MongoDB Connection Failed: ', error);
    }
}

module.exports = connectDB;