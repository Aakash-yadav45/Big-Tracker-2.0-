const router = require('express').Router();
const { authorize } = require('../Middlewares/authenticate');
const { validate } = require('express-validation');
const { upload } = require('../Middlewares/uploadImage');
const { uploadAudio } = require('../Middlewares/uploadAudio');

// Inmport controllers
const { login, clockIn, clockOut, startVisit, startDiscussion, overDiscussion, logout, getLocation, overVisit, sync } = require('../Controllers/userControllers');

// Import models
const loginValidate = require('../Validations/login');
const { getLocationValidate, startVisitValidate, overVisitValidate } = require('../Validations/Employee/EmployeeValidate');

// =============== POST Methods ========================

// Login Employee
router.post('/login', validate(loginValidate), login);

// clock In
router.post('/clock-in', authorize(["user"]), clockIn);

// getLocation
router.post('/getLocation',validate(getLocationValidate), authorize(["user"]), getLocation);

// Visit Doctor Details 
router.post('/startVisit',upload.single('doctorImage'), authorize(["user"]), startVisit);

// Start Discussion
router.post('/startDiscussion', authorize(["user"]), startDiscussion);

// Over Discussion
router.post('/overDiscussion', validate(overVisitValidate),uploadAudio.single('audio'), authorize(["user"]), overDiscussion);

// Over Visit
router.post('/overVisit', uploadAudio.single('audio'), authorize(['user']), overVisit);

// sync Data
router.post('/sync', authorize(["user"]),sync);

// clock Out
router.post('/clock-out', authorize(["user"]), clockOut);

// Logout
router.post('/logout', logout);


module.exports = router;