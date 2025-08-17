const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();
const MAX_COURSES_PER_USER = 5; // max courses per user

// Middleware: verify token
function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // user ID
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
}

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Register courses for a user with conflict checks
router.post("/register", auth, async (req, res) => {
  try {
    const { courseIds } = req.body;
    const user = await User.findById(req.user).populate("registeredCourses");
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.registeredCourses = user.registeredCourses || [];

    // Filter out courses already registered
    const newCourseIds = courseIds.filter(id => !user.registeredCourses.map(c => c._id.toString()).includes(id));
    if (newCourseIds.length === 0) {
      return res.status(400).json({ msg: "You are already registered for these courses" });
    }

    const selectedCourses = await Course.find({ _id: { $in: newCourseIds } });

    // ----- 1. Max courses per user -----
    if (user.registeredCourses.length + selectedCourses.length > MAX_COURSES_PER_USER) {
      return res.status(400).json({ msg: `Cannot register more than ${MAX_COURSES_PER_USER} courses` });
    }

    // ----- 2. Time slot conflicts -----
    const existingTimes = user.registeredCourses.map(c => c.timeslot);
    for (let course of selectedCourses) {
      if (existingTimes.includes(course.timeslot)) {
        return res.status(400).json({ msg: `Conflict: ${course.name} overlaps with an already registered course at ${course.timeslot}` });
      }
    }

    // ----- 3. Prerequisites check -----
    const userCourseIds = user.registeredCourses.map(c => c._id.toString());
    for (let course of selectedCourses) {
      if (course.prerequisites && course.prerequisites.length > 0) {
        const missing = course.prerequisites.filter(reqId => !userCourseIds.includes(reqId.toString()));
        if (missing.length > 0) {
          return res.status(400).json({ msg: `Cannot register for ${course.name}. Missing prerequisites.` });
        }
      }
    }

    // ----- 4. Seat availability -----
    for (let course of selectedCourses) {
      if (course.seats <= 0) {
        return res.status(400).json({ msg: `${course.name} has no seats left.` });
      }
    }

    // Deduct seats
    for (let course of selectedCourses) {
      course.seats -= 1;
      await course.save();
    }

    // Update user registration
    user.registeredCourses.push(...selectedCourses.map(c => c._id));
    await user.save();

    // Return updated data
    const updatedCourses = await Course.find();
    const updatedUser = await User.findById(user._id).populate("registeredCourses");

    res.json({
      msg: "Courses registered successfully",
      updatedCourses,
      registeredCourses: updatedUser.registeredCourses
    });

  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).send("Server error");
  }
});

// Get registered courses
router.get("/my-courses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate("registeredCourses").exec();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.registeredCourses || []);
  } catch (err) {
    console.error("MyCourses error:", err);
    res.status(500).send("Server error");
  }
});

// Drop a registered course
router.post("/drop", auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ msg: "courseId is required" });

    // Only pull if registered
    const pullRes = await User.updateOne(
      { _id: req.user, registeredCourses: courseId },
      { $pull: { registeredCourses: courseId } }
    );

    if (pullRes.modifiedCount === 0) return res.status(400).json({ msg: "You are not registered for this course" });

    // Increment seats
    await Course.updateOne({ _id: courseId }, { $inc: { seats: 1 } });

    const updatedUser = await User.findById(req.user).populate("registeredCourses").exec();
    const updatedCourse = await Course.findById(courseId);

    res.json({
      msg: "Course dropped successfully",
      myCourses: updatedUser?.registeredCourses || [],
      updatedCourse
    });
  } catch (err) {
    console.error("Drop error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
