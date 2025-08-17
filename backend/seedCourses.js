// seedCourses.js
const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./models/Course");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // clear old data
    await Course.deleteMany();

    // insert sample courses
    await Course.insertMany([
      { name: "Data Structures", credits: 4, timeslot: "Mon 9-11 AM", seats: 65 },
      { name: "Algorithms", credits: 4, timeslot: "Tue 11-1 PM", seats: 70 },
      { name: "Operating Systems", credits: 3, timeslot: "Wed 2-4 PM", seats: 60 },
      { name: "Database Systems", credits: 3, timeslot: "Thu 9-11 AM", seats: 70 },
      { name: "Computer Networks", credits: 3, timeslot: "Fri 11-1 PM", seats: 68 },
      { name: "Machine Learning", credits: 4, timeslot: "Sat 10-12 AM", seats: 66 },
    ]);

    console.log("✅ Courses seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding courses:", err);
    process.exit(1);
  }
}

seed();
