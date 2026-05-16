const Student = require('../models/Student');
const Result = require('../models/Result');

// @desc    Get student results
// @route   GET /api/student/results
// @access  Private/Student
const getMyResults = async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const results = await Result.find({
    studentId: student._id,
    published: true,
  }).populate('subjectId', 'subjectName subjectCode');

  res.json(results);
};

// @desc    Get student profile details
// @route   GET /api/student/profile
// @access  Private/Student
const getMyProfile = async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email profileImage');

  if (student) {
    res.json(student);
  } else {
    res.status(404);
    throw new Error('Student profile not found');
  }
};

// @desc    Get subjects for student's current semester
// @route   GET /api/student/curriculum
// @access  Private/Student
const getMyCurriculum = async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const Subject = require('../models/Subject');
  const subjects = await Subject.find({
    semester: student.semester,
    department: student.department
  }).sort({ subjectName: 1 });

  res.json(subjects);
};

module.exports = {
  getMyResults,
  getMyProfile,
  getMyCurriculum,
};
