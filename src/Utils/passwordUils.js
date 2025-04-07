const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds); // Hash only once
};

const comparePassword = async (enteredPassword, storedHashedPassword) => {
    return await bcrypt.compare(enteredPassword, storedHashedPassword);
};

module.exports = { hashPassword, comparePassword };
