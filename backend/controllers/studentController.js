const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Student = require('../models/Student');
const Result = require('../models/Result');
const Subject = require('../models/Subject');
const {
  getSubjectsForDepartment,
  buildSemesterStatus,
  departmentMatches,
} = require('../utils/departmentUtils');

// @desc    Get student results
// @route   GET /api/student/results
// @access  Private/Student
const getMyResults = async (req, res) => {
  const allResults = await Result.find({
    studentId: req.student._id,
    published: true,
  }).populate('subjectId', 'subjectName subjectCode credits department').lean();

  const results = allResults.filter(r => 
    r.subjectId && departmentMatches(r.subjectId.department, req.student.department)
  );

  res.json(results);
};

// @desc    Get student profile details
// @route   GET /api/student/profile
// @access  Private/Student
const getMyProfile = async (req, res) => {
  res.json(req.student);
};

// @desc    Get subjects for student's department across all semesters
// @route   GET /api/student/curriculum
// @access  Private/Student
const getMyCurriculum = async (req, res) => {
  const subjects = await getSubjectsForDepartment(Subject, req.student.department);
  res.json(subjects);
};

// @desc    Combined dashboard data (profile, results, curriculum, semester status)
// @route   GET /api/student/dashboard
// @access  Private/Student
const getDashboard = async (req, res) => {
  const [allResults, curriculum] = await Promise.all([
    Result.find({
      studentId: req.student._id,
      published: true,
    }).populate('subjectId', 'subjectName subjectCode credits semester department').lean(),
    getSubjectsForDepartment(Subject, req.student.department),
  ]);

  const results = allResults.filter(r => 
    r.subjectId && departmentMatches(r.subjectId.department, req.student.department)
  );

  const semesterStatus = buildSemesterStatus(curriculum, results);

  res.json({
    profile: req.student,
    results,
    curriculum,
    semesterStatus,
  });
};

// @desc    Update student profile (name, email, phone, photo)
// @route   PUT /api/student/profile
// @access  Private/Student
const updateMyProfile = async (req, res) => {
  const user = await User.findById(req.student.userId._id || req.student.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name) user.name = req.body.name.trim();
  if (req.body.email) user.email = req.body.email.trim().toLowerCase();
  if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

  if (req.file) {
    if (user.profileImage && user.profileImage.startsWith('/uploads/profiles/')) {
      const oldPath = path.join(__dirname, '..', user.profileImage.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
  }

  await user.save();
  const updatedStudent = await Student.findById(req.student._id).populate('userId', 'name email profileImage phone');

  res.json(updatedStudent);
};

// @desc    Academic toppers leaderboard
// @route   GET /api/student/toppers
// @access  Private/Student
const getToppers = async (req, res, next) => {
  try {
    const toppers = await Result.aggregate([
      { $match: { published: true } },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: { $multiply: ['$GPA', '$subject.credits'] } },
          totalCredits: { $sum: '$subject.credits' },
        },
      },
      {
        $project: {
          _id: 1,
          avgGPA: {
            $cond: [
              { $gt: ['$totalCredits', 0] },
              { $divide: ['$totalPoints', '$totalCredits'] },
              0,
            ],
          },
        },
      },
      { $sort: { avgGPA: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'student.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          avgGPA: 1,
          'student.registerNumber': 1,
          'student.department': 1,
          'user.name': 1,
          'user.profileImage': 1,
        },
      },
    ]);
    res.json(toppers.filter((t) => t.user && t.student));
  } catch (error) {
    console.error('Toppers aggregation error:', error);
    next(error);
  }
};

module.exports = {
  getMyResults,
  getMyProfile,
  getMyCurriculum,
  getDashboard,
  updateMyProfile,
  getToppers,
};
