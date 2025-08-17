const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  timeslot: { type: String, required: true },
  seats: { type: Number, required: true, default: 70 }, // 60–70 seats
});

module.exports = mongoose.model("Course", CourseSchema);
