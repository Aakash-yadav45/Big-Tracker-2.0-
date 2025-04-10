require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../Models/Employee');
const { encrypt } = require('../Utils/encript');

console.log(process.env.MONGO_URL);


mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected in seeder");
});

const seedAdmin = async () => {
    try {
        const existesAdmin = await Employee.findOne({ email: encrypt("aakash@gmail.com") });

        if (existesAdmin) {
            console.log("Admin already exists!");
            return;
        }

        const admin = new Employee({
            name: process.env.ADMIN_NAME || "Aakash yadav",
            mobile: process.env.ADMIN_MOBILE || '8817978567',
            email: process.env.ADMIN_EMAIL || "aakash@gmail.com",
            username: process.env.ADMIN_USERNAME || "aakash_45",
            password: process.env.PASSWORD || 12345678,
            role: "admin",
            isAdmin: true,
        });

        await admin.save();
        console.log("Admin user created successfully!");
    } catch (error) {
        console.log("Error in creating admin user:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

seedAdmin();
