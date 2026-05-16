const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      unique: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
