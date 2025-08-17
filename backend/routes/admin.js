const express = require("express");
const Course = require("../models/Course");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// ----- CREATE a course -----
router.post("/courses", adminAuth, async (req, res) => {
  try {
    const { name, credits, timeslot, seats, prerequisites } = req.body;
    const course = new Course({ name, credits, timeslot, seats, prerequisites });
    await course.save();
    res.json({ msg: "Course created", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----- READ all courses -----
router.get("/courses", adminAuth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----- UPDATE a course -----
router.put("/courses/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // name, credits, seats, timeslot, prerequisites
    const course = await Course.findByIdAndUpdate(id, updates, { new: true });
    if (!course) return res.status(404).json({ msg: "Course not found" });
    res.json({ msg: "Course updated", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----- DELETE a course -----
router.delete("/courses/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ msg: "Course not found" });
    res.json({ msg: "Course deleted", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
