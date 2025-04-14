const router = require('express').Router();
const { authorize } = require('../Middlewares/authenticate');
const { validate } = require('express-validation');
const { upload } = require('../Middlewares/uploadImage');
const { uploadAudio } = require('../Middlewares/uploadAudio');

// Inmport controllers
const { login, clockIn, clockOut, startVisit, startDiscussion, overDiscussion, logout, getLocation, overVisit, uploadDiscussionAudio } = require('../Controllers/userControllers');

// Import models
const loginValidate = require('../Validations/login');
const { getLocationValidate, startVisitValidate, overVisitValidate } = require('../Validations/Employee/EmployeeValidate');
const EmployeeTracking = require('../Models/EmployeeTracking');

// =============== GET Methods ========================

router.get('/home', authorize(["user"]), async (req, res) => {
    try {
        res.status(200).render('Employee/home');
    } catch (error) {
        console.log("Error in redering home page:- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." });
    }
})

// clock In
router.get('/clock-in', authorize(["user"]), clockIn);


router.get('/getLocation', authorize(["user"]), async (req, res) => {
    try {
        const tracking = await EmployeeTracking.findOne({ employeeId: req.user._id, checkOutTime: null });

        if (!tracking) {
            return res.status(400).json({ message: "User is alrady checked in." })
        }

        res.status(200).render('Employee/location');
    } catch (error) {
        console.log("Error in redering location page:- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." });
    }
})

router.get('/startVisit', authorize(["user"]), async (req, res) => {
    try {
        res.status(200).render("Employee/doctor");
    } catch (error) {
        console.log("Error in start Visit:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
});


// Start Discussion
router.get('/startDiscussion', authorize(["user"]), startDiscussion);

// start Audio
router.get('/startAudio', authorize(["user"]), async (req, res) => {
    try {
        res.status(200).render("Employee/audio");
    } catch (error) {
        console.log("Error in render audio templete:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
});


// =============== POST Methods ========================


// Login Employee
router.post('/login', validate(loginValidate), login);

// getLocation
router.post('/getLocation', validate(getLocationValidate), authorize(["user"]), getLocation);

// Visit Doctor Details 
router.post('/startVisit', upload.single('doctorImage'), authorize(["user"]), startVisit);

// Start Discussion
router.post('/startDiscussion', authorize(["user"]), startDiscussion);

// Over Discussion
router.post('/overDiscussion', validate(overVisitValidate), uploadAudio.single('audio'), authorize(["user"]), overDiscussion);

// Over Visit
router.post('/overVisit', uploadAudio.single('audio'), authorize(['user']), overVisit);

// clock Out
router.post('/clock-out', authorize(["user"]), clockOut);

// Audio upload
router.post('/uploadDiscussionAudio', uploadAudio.single('audio'), authorize(["user"]), uploadDiscussionAudio);

// Logout
router.post('/logout', logout);


module.exports = router;