const { Joi } = require('express-validation');

const getLocationValidate = {
    body: Joi.object({
        clockInPlace: Joi.string().trim().min(3).max(30).required().messages({
            'string.base': 'clock-in place must be a string.',
            'string.empty': 'clock-in place is required.',
            'string.min': 'clock-in place must be at least 3 characters long.',
            'string.max': 'clock-in place must be at most 30 characters long.',
            'any.required': 'clock-in place is required.',
        })
    })
};

const startVisitValidate = {
    body: Joi.object({
        doctorName: Joi.string().trim().min(3).max(15).required().messages({
            'string.base': 'Doctor name must be a string.',
            'string.empty': 'Doctor name is required.',
            'string.min': 'Doctor name must be at least 3 characters long.',
            'string.max': 'Doctor name must be at most 15 characters long.',
            'any.required': 'Doctor name is required.',
        })
    })
};

const overVisitValidate = {
    body: Joi.object({
        notes: Joi.string().trim().max(500).optional().messages({
            'string.base': 'Notes must be a string.',
            'string.max': 'Notes must be at most 500 characters long.'
        })
    })
};


module.exports = { getLocationValidate, startVisitValidate, overVisitValidate };