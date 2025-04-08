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

        const tracker = await EmployeeTracking.findOne({ employeeId, clockOutTime: null,clockInTime:{$gte:startDay,$lte:endDay } });

        if (tracker) {
            return res.status(400).json({ message: "Employee is alrady clocked in." })
        }

        const clockInTime = moment().toDate();
        const currentTime = moment(clockInTime).format('hh:mm A');

        const newEmployeetracker = {
            employeeId,
            clockInTime: moment().toDate()
        }

        await EmployeeTracking.create(newEmployeetracker);

        res.status(200).json({ message: `${moment(newEmployeetracker.clockInTime).format('hh:mm A') } is your clock-in time for the day.` })
    } catch (error) {
        console.log("Error in redering location page:- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." });
    }
}

// Get visit location
const   getLocation = async (req, res) => {
    try {
        const { clockInPlace } = req.body;
        console.log(clockInPlace);
        
        const employeeId = req.user._id;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(404).json({ message: "Employee not clock-in. Please first clock-in" });
        }

        if (tracker.clockInPlace) {
            return res.status(400).json({ message: "Your clock-in location is already stored" });
        }

        tracker.clockInPlace = clockInPlace

        await tracker.save();
        res.status(200).json({ message: "location submited successfully!" })
    } catch (error) {
        console.log("Error in clock-in:- ", error.message);
        return res.status(500).json({ message: "Somthing went wrong. Please try again later." });

    }
}

// Start visit
const startVisit = async (req, res) => {
    try {
        console.log(req.body);

        const { doctorName } = req.body;
        const doctorImage = req.file ? req.file.filename : null;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId:req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(404).json({ message: "Employee has not clocked in." });
        }

        if (!tracker.clockInPlace) {
            return res.status(404).json({ message: "clock-in place not found." });
        }

        // Create a new visit object
        const newVisit = {
            visitStartTime: moment().toDate(),
            doctorName,
            doctorImage,
            startLocation: "20.81° N, 72.81° E",
        };

        if (tracker.visits.length === 0) {
            tracker.visits.push(newVisit);
        } else {
            const currentVisit = tracker.visits.find(visit => visit.visitEndTime === null);
            if (currentVisit) {
                return res.status(400).json({ message: "Employee is already start visit" })
            } else {
                tracker.visits.push(newVisit);
            }
        }

        await tracker.save();
        res.status(200).json({ message: "Visit start successfully!" });
    } catch (error) {
        console.log("Error in clock-in:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

// Start Discussion
const startDiscussion = async (req, res) => {
    try {
        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(400).json({ message: "Employee tracker can't start .Please clock in" });
        }

        if (tracker.visits.length === 0) {
            return res.status(400).json({ message: "Employee can't start a discussion without starting a visit." });
        }

        const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

        if (!activeVisit) {
            return res.status(400).json({ message: "The employee is not currently on any visit.." });
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
                return res.status(400).json({ message: "Current discussion is running" });
            } else {
                activeVisit.discussions.push(newDiscussion);
            }
        }

        await tracker.save();

        res.status(200).json({ message: "Discussion started successfully!" });
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

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(400).json({ message: "Employee tracker can't start .Please clock in" });
        }

        if (tracker.visits.length === 0) {
            return res.status(400).json({ message: "Employee can't start a discussion without starting a visit." });
        }

        const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

        if (!activeVisit) {
            return res.status(400).json({ message: "The employee is not currently on any visit.." });
        }

        if (activeVisit.discussions.length === 0) {
            return res.status(400).json({ message: "No discussions found for the current visit." });
        }

        const currentDiscussion = activeVisit.discussions.find(discussion => discussion.endTime === null);

        if (!currentDiscussion) {
            return res.status(400).json({ message: "No discussion in running" });
        }

        // Over Discussion
        currentDiscussion.audioFile = audioFile;
        currentDiscussion.endTime = moment().toDate();

        await tracker.save();

        res.status(200).json({ message: "Discussion overed successfully!" });
    } catch (error) {
        console.log("Erroor in overDiscussion:- ", error.message);
        return res.status(500).json({ message: "Somthing went wrong. Please try again later" });
    }
}


// Over Visit
const overVisit = async (req, res) => {
    try {
        const { notes } = req.body;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(400).json({ message: "Employee tracker can't start .Please clock in" });
        }

        if (tracker.visits.length === 0) {
            return res.status(400).json({ message: "Employee can't start a discussion without starting a visit." });
        }

        const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

        if (!activeVisit) {
            return res.status(400).json({ message: "The employee is not currently on any visit.." });
        }

        if (activeVisit.discussions.length !== 0) {
            const activDescussion = activeVisit.discussions.find(discussion => discussion.endTime === null);
            if (activDescussion) {
                activDescussion.audioFile = "audio_q2gv8_1744005639649.mp3";
                activDescussion.endTime = moment().toDate();
            }
        }

        activeVisit.visitEndTime = moment().toDate();
        activeVisit.endLocation = "21.2049° N, 72.8411° E";
        activeVisit.notes = notes;

        await tracker.save();

        res.status(200).json({ message: "Visit over successfully!" });
    } catch (error) {
        console.log("Error in overVisit:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later" });
    }
}

// clock-out
const clockOut = async (req, res) => {
    try {
        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null, clockInTime: { $gte: startDay, $lte: endDay } });

        if (!tracker) {
            return res.status(400).json({ message: "Employee has not clocked in." });
        }

        if (tracker.visits.length !== 0) {
            const activeVisit = tracker.visits.find(visit => visit.visitEndTime === null);

            if (activeVisit) {
                const activDescussion = activeVisit.discussions.find(discussion => discussion.endTime === null);

                if (activDescussion) {
                    activDescussion.audioFile = "audio_q2gv8_1744005639649.mp3";
                    activDescussion.endTime = moment().toDate();
                }
                activeVisit.visitEndTime = moment().toDate();
                activeVisit.endLocation = "21.2049° N, 72.8411° E";
                activeVisit.notes = "No data found";
            }
        }

        tracker.clockOutTime = moment().toDate();;

        await tracker.save();

        res.status(200).json({ message: `Your clock-out time is ${moment(clockIn.clockOutTime).format('hh:mm A')} for the day.` });
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
const uploadDiscussionAudio = async(req, res) =>{
    try {
        // visitId and discussionId are received from the frontend 
        const visitId = "67f50e16b9a89850ea1214c9";
        const discussionId = "67f50e25b9a89850ea1214ce";

        const tracker = await EmployeeTracking.findOne({ employeeId: req.user._id });
        
        const currVisit = tracker.visits.find(visit => visit._id.toString() === visitId);
        
        const currDiscussion = currVisit.discussions.find(discussion => discussion._id.toString() === discussionId);
        
        currDiscussion.audioFile = req.file ? req.file.filename : null;

        await tracker.save();
        
        res.status(200).json({ message: "Audio uploaded successfully" });
    } catch (error) {
        console.log("Error in upload audio :- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });

    }
}

module.exports = { login, clockIn, getLocation, startVisit, startDiscussion, overDiscussion, overVisit, clockOut, uploadDiscussionAudio, logout };