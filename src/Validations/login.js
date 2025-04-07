const { Joi } = require("express-validation");

const loginValidate = {
    body: Joi.object({
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
        })
    })
};

module.exports = loginValidate;
