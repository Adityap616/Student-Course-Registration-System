const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  registeredCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: [] }
  ],
  maxCredits: { type: Number, default: 20 } // optional, for per-user limit
});

module.exports = mongoose.model("User", UserSchema);
