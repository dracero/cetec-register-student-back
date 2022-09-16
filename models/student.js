var mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: false
  },
  date: {
    type: Date,
    required: true,
    trim: true,
    lowercase: true,
  },
  image: {
    type: String,
    required: true,
  }
});

const student = mongoose.model("student", studentSchema);

module.exports = student;
