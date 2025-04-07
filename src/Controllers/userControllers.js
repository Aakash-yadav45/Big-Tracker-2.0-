const moment = require('moment');
const { comparePassword } = require('../Utils/passwordUils');
const { generateToken } = require('../Middlewares/authenticate');

// Import models
const EmployeeTracking = require('../Models/EmployeeTracking');
const Employee = require('../Models/Employee');

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

const clockIn = async (req, res) => {
    try {
        const employeeId = req.user._id
        const tracking = await EmployeeTracking.findOne({ employeeId, clockOutTime: null });

        if (tracking) {
            return res.status(400).json({ message: "Employee is alrady clocked in." })
        }

        const clockInTime = moment().toDate();
        const currentTime = moment(clockInTime).format('hh:mm A');

        const newEmployeeTracking = {
            employeeId,
            clockInTime
        }

        await EmployeeTracking.create(newEmployeeTracking);

        res.status(200).json({ message: `${currentTime} is your clock-in time for the day.` })
    } catch (error) {
        console.log("Error in redering location page:- ", error.message);
        res.status(500).json({ message: "Somthing went wrong. Please try again later." });
    }
}

const getLocation = async (req, res) => {
    try {
        const { clockInPlace } = req.body;
        const employeeId = req.user._id;

        const clockIn = await EmployeeTracking.findOne({ employeeId, clockOutTime: null });

        if (!clockIn) {
            return res.status(404).json({ message: "Employee not clock-in. Please first clock-in" });
        }

        if (clockIn.clockInPlace) {
            return res.status(400).json({ message: "Your clock-in location is already stored" });
        }

        await EmployeeTracking.updateOne(
            { employeeId, clockOutTime: null },
            { $set: { clockInPlace } }
        );

        res.status(200).json({ message: "location submited successfully!" })
    } catch (error) {
        console.log("Error in clock-in:- ", error.message);
        return res.status(500).json({ message: "Somthing went wrong. Please try again later." });

    }
}


const startVisit = async (req, res) => {
    try {
        console.log(req.body);

        const { doctorName } = req.body;
        const doctorImage = req.file ? req.file.filename : null;

        const clockIn = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null });

        console.log("clockIn:- ", clockIn);

        if (!clockIn) {
            return res.status(404).json({ message: "Employee has not clocked in." });
        }

        if (!clockIn.clockInPlace) {
            return res.status(404).json({ message: "clock-in place not found." });
        }

        // Create a new visit object
        const newVisit = {
            visitStartTime: moment().toDate(),
            doctorName,
            doctorImage,
            startLocation: "20.81° N, 72.81° E",
        };

        if (clockIn.visits.length === 0) {
            clockIn.visits.push(newVisit);
        } else {
            const currentVisit = clockIn.visits.find(visit => visit.visitEndTime === null);
            console.log("CurrectVisit:- ", currentVisit);

            if (currentVisit) {
                return res.status(400).json({ message: "Employee is already start visit" })
            } else {
                clockIn.visits.push(newVisit);
            }
        }

        await clockIn.save();
        res.status(200).json({ message: "Visit start successfully!" });
    } catch (error) {
        console.log("Error in clock-in:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

// Start Discussion
const startDiscussion = async (req, res) => {
    try {
        const tracking = await EmployeeTracking.findOne({ employeeId: req.user._id, clockOutTime: null });

        console.log("tracking:- ", tracking);
        if (!tracking) {
            return res.status(400).json({ message: "Employee tracker can't start .Please clock in" });
        }

        if (tracking.visits.length === 0) {
            return res.status(400).json({ message: "Employee can't start a discussion without starting a visit." });
        }

        const activeVisit = tracking.visits.find(visit => visit.visitEndTime === null);
        console.log("activeVisit:- ", activeVisit);

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

        await tracking.save();

        res.status(200).json({ message: "Discussion started successfully!" });
    } catch (error) {
        console.log("Erroor in startDiscussion:- ", error.message);
        return res.status(500).json({ message: "Somthing went wrong. Please try again later" });
    }
}


// Over Discussion
const overDiscussion = async (req, res) => {
    try {
        const employeeId = req.user._id
        const audioFile = req.file ? req.file.filename : null;

        const clockIn = await EmployeeTracking.findOne({ employeeId, clockOutTime: null });

        if (!clockIn) {
            return res.status(400).json({ message: "Employee tracker can't start .Please clock in" });
        }

        if (clockIn.visits.length === 0) {
            return res.status(400).json({ message: "Employee can't start a discussion without starting a visit." });
        }

        const activeVisit = clockIn.visits.find(visit => visit.visitEndTime === null);

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

        await clockIn.save();

        res.status(200).json({ message: "Discussion overed successfully!" });
    } catch (error) {
        console.log("Erroor in overDiscussion:- ", error.message);
        return res.status(500).json({ message: "Somthing went wrong. Please try again later" });
    }
}


// Over Visit
const overVisit = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const { notes } = req.body;
        const clockIn = await EmployeeTracking.findOne({ employeeId, clockOutTime: null });

        if (!clockIn) {
            return res.status(400).json({ message: "Employee tracker can't start .Please clock in" });
        }

        if (clockIn.visits.length === 0) {
            return res.status(400).json({ message: "Employee can't start a discussion without starting a visit." });
        }

        const activeVisit = clockIn.visits.find(visit => visit.visitEndTime === null);

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

        await clockIn.save();

        res.status(200).json({ message: "Visit over successfully!" });
    } catch (error) {
        console.log("Error in overVisit:- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later" });
    }
}

// clock-out
const clockOut = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const clockIn = await EmployeeTracking.findOne({ employeeId, clockOutTime: null });

        if (!clockIn) {
            return res.status(400).json({ message: "Employee has not clocked in." });
        }

        if (clockIn.visits.length !== 0) {
            const activeVisit = clockIn.visits.find(visit => visit.visitEndTime === null);

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

        clockIn.clockOutTime = moment().toDate();;

        await clockIn.save();

        res.status(200).json({ message: `Your clock-out time is ${moment(clockOutTime).format('hh:mm A')} for the day.` });
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

const sync = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const startDay = moment().startOf('day').toDate();
        const endDay = moment().endOf('day').toDate();

        const track = await EmployeeTracking.find({
            employeeId,
            clockInTime: {
                $gte: startDay,
                $lte: endDay
            }
        });

        console.log(track);

        if (!track) {
            return res.status(404).json({ message: "No tracking data found for today." });
        }

        res.status(200).json({ messge: "Data recieved successfully!" });
    } catch (error) {
        console.log("Error in Sync data :- ", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
}

module.exports = { login, clockIn, getLocation, startVisit, startDiscussion, overDiscussion, overVisit, sync, clockOut, logout };