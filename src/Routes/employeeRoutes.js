const router = require('express').Router();
const moment = require('moment');
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
router.post('/clock-in', authorize(["user"]), clockIn);


router.get('/getLocation', authorize(["user"]), async (req, res) => {
    try {
        const employeeId = req.user._id;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(404).json({ message: "You have not  clocked-in. Please clock-in before submitting your location." });
        }

        if (tracker.clockInPlace) {
            return res.status(400).json({ message: "Your clock-in location is already recorded!" });
        }

        res.status(200).render('Employee/location');
    } catch (error) {
        console.log("Error in redering location page:- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." });
    }
})

router.get('/startVisit', authorize(["user"]), async (req, res) => {
    try {
        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(404).json({ message: "You have not clocked in before starting a visit." });
        }

        if (!tracker.clockInPlace) {
            return res.status(404).json({ message: "Clock-in location not found. Please submit your location before starting visit." });
        }

        if (tracker.visits.length !== 0) {
            const currentVisit = tracker.visits.find(visit => visit.visitEndTime === null);
            if (currentVisit) {
                return res.status(400).json({ message: "You already have an ongoing visit. Please end it before starting a new visit." })
            }
        }
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
router.post('/overDiscussion', uploadAudio.single('audio'), authorize(["user"]), overDiscussion);

// Over Visit
router.post('/overVisit', uploadAudio.single('audio'), authorize(['user']), overVisit);

// clock Out
router.post('/clock-out', authorize(["user"]), clockOut);

// Audio upload
router.post('/uploadDiscussionAudio', uploadAudio.single('audio'), authorize(["user"]), uploadDiscussionAudio);

// Logout
router.post('/logout', logout);


module.exports = router;