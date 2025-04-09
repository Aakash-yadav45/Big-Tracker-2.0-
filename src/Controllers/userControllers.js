const moment = require('moment');
const { comparePassword } = require('../Utils/passwordUils');
const { generateToken } = require('../Middlewares/authenticate');

// Import models
const EmployeeTracking = require('../Models/EmployeeTracking');
const Employee = require('../Models/Employee');

// Login 
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Employee.findOne({ username, isDisable: false });

        if (!user) {
            return res.status(404).json({ message: "Invailid username. Enter valid username." })
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(404).json({ message: "Invailid password. Enter valid username." });
        }

        generateToken(user, res);
        req.user = user;

        res.status(200).json({ message: "Login successfully!" });
    } catch (error) {
        console.log("Error in login:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
}

// Clock-in
const clockIn = async (req, res) => {
    try {
        const employeeId = req.user._id
        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (tracker) {
            return res.status(400).json({ message: "You have already clocked in for today." });
        }

        const newEmployeetracker = {
            employeeId,
            clockInTime: moment().toDate()
        }

        await EmployeeTracking.create(newEmployeetracker);

        res.status(200).json({
            message: `You have successfully clocked in at ${moment(newEmployeetracker.clockInTime).format('hh:mm A')}.`
        });
    } catch (error) {
        console.log("Error in clock-in process: ", error.message);
        res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
    }
}

// Get visit location
const getLocation = async (req, res) => {
    try {
        const { clockInPlace } = req.body;

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

        tracker.clockInPlace = clockInPlace

        await tracker.save();
        res.status(200).json({ message: "Your location has been submited successfully!" });
    } catch (error) {
        console.log("Error in clock-in location submission: ", error.message);
        return res.status(500).json({
            message: "Something went wrong. Please try again later."
        });

    }
}

// Start visit
const startVisit = async (req, res) => {
    try {
        const { doctorName } = req.body;
        const doctorImage = req.file ? req.file.filename : null;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(404).json({ message: "You have not clocked in before starting a visit." });
        }

        if (!tracker.clockInPlace) {
            return res.status(404).json({ message: "Clock-in location not found. Please submit your location before starting visit." });
        }

        // Create a new visit object
        const newVisit = {
            visitStartTime: moment().toDate(),
            doctorName,
            doctorImage,
            startLocation: "21.197126617428903, 72.79413816403962",
        };

        if (tracker.visits.length === 0) {
            tracker.visits.push(newVisit);
        } else {
            const currentVisit = tracker.visits.find(visit => visit.visitEndTime === null);
            if (currentVisit) {
                return res.status(400).json({ message: "You already have an ongoing visit. Please end it before starting a new visit." })
            } else {
                tracker.visits.push(newVisit);
            }
        }

        await tracker.save();
        res.status(200).json({ message: "Your visit has started successfully!" });
    } catch (error) {
        console.log("Error in starting visit: ", error.message);        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

// Start Discussion
const startDiscussion = async (req, res) => {
    try {
        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(400).json({ message: "You must clock in before starting a discussion." });
        }

        if (tracker.visits.length === 0) {
            return res.status(400).json({ message: "You need to start a visit before start descussion." });
        }

        const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

        if (!activeVisit) {
            return res.status(400).json({ message: "No active visit found. Please start a visit first" });
        }

        // Create a new Discussion
        const newDiscussion = {
            startTime: moment().toDate(),
        }

        if (activeVisit.discussions.length === 0) {
            activeVisit.discussions.push(newDiscussion);
        } else {
            const currentDiscussion = activeVisit.discussions.find(discussion => discussion.endTime === null);
            if (currentDiscussion) {
                return res.status(400).json({ message: "A discussion is already in progress. Please end it before starting a new discussion" });
            } else {
                activeVisit.discussions.push(newDiscussion);
            }
        }

        await tracker.save();

        res.status(200).json({ message: "Discussion started successfully." });
    } catch (error) {
        console.log("Erroor in startDiscussion:- ", error.message);
        return res.status(500).json({ message: "Somthing went wrong. Please try again later" });
    }
}


// Over Discussion
const overDiscussion = async (req, res) => {
    try {
        const audioFile = req.file ? req.file.filename : null;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({
            employeeId: req.user._id,
            clockOutTime: null,
            clockInTime: { $gte: startDay, $lte: endDay }
        });

        if (!tracker) {
            return res.status(400).json({ message: "You must clock in before starting a discussion." });
        }

        if (tracker.visits.length === 0) {
            return res.status(400).json({ message: "Please start a visit before beginning a discussion." });
        }

        const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

        if (!activeVisit) {
            return res.status(400).json({ message: "You are not currently on an active visit." });
        }

        if (activeVisit.discussions.length === 0) {
            return res.status(400).json({ message: "No discussions found for the current visit." });
        }

        const currentDiscussion = activeVisit.discussions.find(discussion => discussion.endTime === null);

        if (!currentDiscussion) {
            return res.status(400).json({ message: "There is no ongoing discussion to end." });
        }

        // End the current discussion
        currentDiscussion.audioFile = audioFile;
        currentDiscussion.endTime = moment().toDate();

        await tracker.save();

        res.status(200).json({ message: "Discussion ended successfully." });
    } catch (error) {
        console.error("Error in overDiscussion:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};


// Over Visit
const overVisit = async (req, res) => {
    try {
        const { notes } = req.body;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({
            employeeId: req.user._id,
            clockOutTime: null,
            clockInTime: { $gte: startDay, $lte: endDay }
        });

        if (!tracker) {
            return res.status(400).json({ message: "You must clock in before ending a visit." });
        }

        if (tracker.visits.length === 0) {
            return res.status(400).json({ message: "You must start a visit before you can end it." });
        }

        const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

        if (!activeVisit) {
            return res.status(400).json({ message: "You are not currently on an active visit." });
        }

        if (activeVisit.discussions.length !== 0) {
            const activeDiscussion = activeVisit.discussions.find(discussion => discussion.endTime === null);
            if (activeDiscussion) {
                activeDiscussion.audioFile = "audio_q2gv8_1744005639649.mp3";
                activeDiscussion.endTime = moment().toDate();
            }
        }

        activeVisit.visitEndTime = moment().toDate();
        activeVisit.endLocation = "21.2140032, 72.8432640";
        activeVisit.notes = notes;

        await tracker.save();

        res.status(200).json({ message: "Visit ended successfully." });
    } catch (error) {
        console.log("Error in overVisit:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};


// Clock-out
const clockOut = async (req, res) => {
    try {
        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({
            employeeId: req.user._id,
            clockOutTime: null,
            clockInTime: { $gte: startDay, $lte: endDay }
        });

        if (!tracker) {
            return res.status(400).json({ message: "You have not clocked in yet." });
        }

        if (tracker.visits.length !== 0) {
            const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

            if (activeVisit) {
                const activeDiscussion = activeVisit.discussions.find(discussion => discussion.endTime === null);

                if (activeDiscussion) {
                    activeDiscussion.audioFile = "audio_q2gv8_1744005639649.mp3";
                    activeDiscussion.endTime = moment().toDate();
                }

                activeVisit.visitEndTime = moment().toDate();
                activeVisit.endLocation = "21.2140032, 72.8432640";
                activeVisit.notes = "No data found";
            }
        }

        tracker.clockOutTime = moment().toDate();

        await tracker.save();

        res.status(200).json({ message: `Clock-out successful at ${moment(tracker.clockOutTime).format('hh:mm A')}.` });
    } catch (error) {
        console.log("Error in clock-out user:", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};


// Logout
const logout = async (req, res) => {
    try {
        // Clear the authentication token from cookies
        res.clearCookie("authToken");

        res.status(200).json({ message: "Logout successfully!" });
    } catch (error) {
        console.error("Logout Error:", error.message);
        res.status(500).json({ message: "Something went wrong. Please Try again later." });
    }
};


// Upload audio
const uploadDiscussionAudio = async (req, res) => {
    try {
        // visitId and discussionId are received from the frontend 
        const trackerId = "67f65e95de97447c0d783950"
        const visitId = "67f65e9fde97447c0d783957";
        const discussionId = "67f65ea3de97447c0d78395c";

        const trackers = await EmployeeTracking.find({ employeeId: req.user._id });

        const currTracker = trackers.find(tracker => tracker._id.toString() === trackerId);

        const currVisit = currTracker.visits.find(visit => visit._id.toString() === visitId);

        const currDiscussion = currVisit.discussions.find(discussion => discussion._id.toString() === discussionId);

        currDiscussion.audioFile = req.file ? req.file.filename : null;

        // await tracker.save();

        res.status(200).json({ message: "Audio uploaded successfully" });
    } catch (error) {
        console.log("Error in upload audio :- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });

    }
}

module.exports = { login, clockIn, getLocation, startVisit, startDiscussion, overDiscussion, overVisit, clockOut, uploadDiscussionAudio, logout };