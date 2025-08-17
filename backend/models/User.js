const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registeredCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: [] } // changed name
  ]
});

module.exports = mongoose.model("User", UserSchema);
