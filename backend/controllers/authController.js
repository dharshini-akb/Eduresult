const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password, loginType } = req.body;
    const identifier = (email || '').trim();

    if (loginType === 'student') {
      if (!identifier) {
        res.status(400);
        throw new Error('Roll number is required');
      }

      const student = await Student.findOne({
        registerNumber: {
          $regex: new RegExp(`^${escapeRegex(identifier)}$`, 'i'),
        },
      }).populate('userId', 'name email role profileImage phone');

      if (!student?.userId) {
        res.status(401);
        throw new Error('Invalid Roll Number');
      }

      const user = student.userId;
      // Allow login with roll number alone for students
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        registerNumber: student.registerNumber,
        department: student.department,
        token: generateToken(user._id),
      });
    }

    if (!identifier || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email: identifier.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      // Strict check: Teachers must have a Teacher record in the admin portal
      if (user.role === 'teacher') {
        const teacher = await Teacher.findOne({ userId: user._id });
        if (!teacher) {
          res.status(401);
          throw new Error('Teacher record not found in admin portal. Please contact admin.');
        }
        
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          department: teacher.department,
          employeeId: teacher.employeeId,
          token: generateToken(user._id),
        });
      }

      // For head and admin, they are allowed if they exist as users
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    }

    res.status(401);
    throw new Error('Invalid email or password');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser, registerUser, getUserProfile };
