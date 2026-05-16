const mongoose = require('mongoose');

const resultSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Subject',
    },
    internalMarks: {
      type: Number,
      required: true,
    },
    externalMarks: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    GPA: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pass', 'Fail'],
    },
    remarks: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    semester: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
