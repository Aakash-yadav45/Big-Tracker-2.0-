const { Joi } = require("express-validation");

const employeeValidate = {
    body: Joi.object({
        name: Joi.string().trim().min(3).max(50).required().messages({
            "any.required": "Name is required",
            "string.empty": "Name cannot be empty",
            "string.min": "Name must be at least 3 characters long",
            "string.max": "Name cannot exceed 50 characters"
        }),
        mobile: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
            "any.required": "Mobile number is required",
            "string.empty": "Mobile number cannot be empty",
            "string.pattern.base": "Mobile number must be exactly 10 digits"
        }),
        email: Joi.string().trim().email().required().messages({
            "any.required": "Email is required",
            "string.empty": "Email cannot be empty",
            "string.email": "Please enter a valid email address"
        }),
        username: Joi.string().trim().min(3).max(20).required().messages({
            "any.required": "Username is required",
            "string.empty": "Username cannot be empty",
            "string.min": "Username must be at least 3 characters long",
            "string.max": "Username cannot exceed 20 characters"
        }),
        password: Joi.string().trim().min(8).max(20).required().messages({
            "any.required": "Password is required",
            "string.empty": "Password cannot be empty",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 20 characters"
        }),
    })
};

module.exports = {employeeValidate};
