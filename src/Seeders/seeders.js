require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../Models/Employee');
const { hashPassword } = require('../Utils/passwordUils');

// MongoDB Connection

mongoose.connect(process.env.MONGO_URL);

const seedAdmin = async () => {
    try {
        // Check if admin already existes
        const existesAdmin = await Employee.findOne({ email: "aakash@gmail.com" });

        if (existesAdmin) {
            console.log("Admin already exists!");
            return;
        }

        const admin = new Employee({
            name: "Aakash yadav",
            mobile: '8817978567',
            email: "aakash@gmail.com",
            username: "aakash_45",
            password: "12345678",
            role: "admin",
            isAdmin: true,
        });
         
        await admin.save();
        console.log("Admin user created successfullly!");
    } catch (error) {
        console.log("Error in creating admin user:- ",error.message);
    } finally {
        mongoose.connection.close();
    }
}

seedAdmin();