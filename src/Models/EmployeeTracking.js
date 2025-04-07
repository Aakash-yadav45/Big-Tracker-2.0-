const mongoose = require("mongoose");
const moment = require("moment");

const discussionSchema = new mongoose.Schema({
    startTime: { type: Date, default: moment().toDate() },
    audioFile: { type: String, default: null },
    endTime: { type: Date, default: null },
});

const visitSchema = new mongoose.Schema({
    doctorName: { type: String, default: null },
    doctorImage: { type: String, default: null, required: true },
    startLocation: { type: String, default: null },
    visitStartTime: { type: Date, required: true, default: moment().toDate() },
    discussions: [discussionSchema],  // Array of discussion
    endLocation: { type: String, default: null },
    visitEndTime: { type: Date, default: null },
    notes: { type: String, default: null },
});

const employeeTrackingSchema = new mongoose.Schema({
    employeeId: { type: String, ref: "Employee", required: true },
    clockInTime: { type: Date, required: true, default: moment().toDate() },
    clockInPlace: { type: String, default: null },
    visits: [visitSchema], // Array of visits
    clockOutTime: { type: Date, default: null }
});

const EmployeeTracking = mongoose.model("EmployeeTracking", employeeTrackingSchema);

module.exports = EmployeeTracking;
