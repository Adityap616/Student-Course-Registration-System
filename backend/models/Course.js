const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  timeslot: { type: String, required: true }, // e.g., "Mon 10:00-12:00"
  seats: { type: Number, required: true, default: 70 },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course", default: [] }]
});

module.exports = mongoose.model("Course", CourseSchema);
