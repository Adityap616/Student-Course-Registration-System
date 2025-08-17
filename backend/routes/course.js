const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

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

// Register courses for a user
router.post("/register", auth, async (req, res) => {
  try {
    const { courseIds } = req.body;
    const user = await User.findById(req.user);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Ensure registeredCourses exists
    user.registeredCourses = user.registeredCourses || [];

    // Filter out courses already registered
    const newCourseIds = courseIds.filter(id => !user.registeredCourses.includes(id));
    if (newCourseIds.length === 0) {
      return res.status(400).json({ msg: "You are already registered for these courses" });
    }

    let totalCredits = 0;
    const selectedCourses = [];

    for (let id of newCourseIds) {
      const course = await Course.findById(id);
      if (!course) continue;

      if (course.seats <= 0) {
        return res.status(400).json({ msg: `${course.name} has no seats left` });
      }

      totalCredits += course.credits;
      selectedCourses.push(course);
    }

    // Check total credits including already registered courses
    const registeredCourses = await Course.find({ _id: { $in: user.registeredCourses } });
    const currentCredits = registeredCourses.reduce((sum, c) => sum + c.credits, 0);

    if (totalCredits + currentCredits > 20) {
      return res.status(400).json({ msg: "Cannot select more than 20 credits" });
    }

    // Deduct seats
    for (let course of selectedCourses) {
      course.seats -= 1;
      await course.save();
    }

    // Update user registration
    user.registeredCourses.push(...selectedCourses.map(c => c._id));
    await user.save();

    const updatedCourses = await Course.find();
    res.json({ msg: "Courses registered successfully", updatedCourses });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).send("Server error");
  }
});

// Get registered courses of logged-in user
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

module.exports = router;
