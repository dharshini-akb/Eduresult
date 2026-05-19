const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Result = require('../models/Result');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalResults = await Result.countDocuments();
    
    const passedStudents = await Result.countDocuments({ status: 'Pass' });
    const failedStudents = await Result.countDocuments({ status: 'Fail' });
    
    // New: Count results that have internal marks but no external marks yet
    const pendingExternal = await Result.countDocuments({
      internalMarks: { $gt: 0 },
      externalMarks: 0
    });

    const passPercentage = totalResults > 0 ? (passedStudents / totalResults) * 100 : 0;

    res.json({
      totalStudents,
      totalTeachers,
      passPercentage: passPercentage.toFixed(2),
      failedStudents,
      totalResults,
      pendingExternal // Notify head about these
    });
  } catch (error) {
    next(error);
  }
};

// --- Teacher Management ---

const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate('userId', 'name email');
    res.json(teachers);
  } catch (error) {
    next(error);
  }
};

const addTeacher = async (req, res, next) => {
  try {
    const { name, email, password, employeeId, department } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) { 
      res.status(400); 
      return next(new Error('User already exists')); 
    }

    const user = await User.create({ name, email, password, role: 'teacher' });
    if (user) {
      const teacher = await Teacher.create({ userId: user._id, employeeId, department });
      res.status(201).json(teacher);
    } else {
      res.status(400); 
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (teacher) {
      teacher.department = req.body.department || teacher.department;
      teacher.employeeId = req.body.employeeId || teacher.employeeId;
      const updatedTeacher = await teacher.save();
      
      const user = await User.findById(teacher.userId);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        await user.save();
      }
      res.json(updatedTeacher);
    } else {
      res.status(404); 
      return next(new Error('Teacher not found'));
    }
  } catch (error) {
    next(error);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (teacher) {
      await User.findByIdAndDelete(teacher.userId);
      await Teacher.findByIdAndDelete(req.params.id);
      res.json({ message: 'Teacher removed' });
    } else {
      res.status(404); 
      return next(new Error('Teacher not found'));
    }
  } catch (error) {
    next(error);
  }
};

// --- Student Management ---

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('userId', 'name email');
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const addStudent = async (req, res, next) => {
  try {
    const { name, email, password, registerNumber, department, semester, section } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) { 
      res.status(400); 
      return next(new Error('User with this email already exists')); 
    }

    const regExists = await Student.findOne({ registerNumber });
    if (regExists) {
      res.status(400);
      return next(new Error('Student with this register number already exists'));
    }

    const user = await User.create({ name, email, password, role: 'student' });
    if (user) {
      try {
        let formattedDept = department.trim();
        if (formattedDept.toLowerCase() === 'cse') formattedDept = 'Computer Science';
        if (formattedDept.toLowerCase() === 'it') formattedDept = 'IT';

        const student = await Student.create({ 
          userId: user._id, 
          registerNumber, 
          department: formattedDept, 
          semester, 
          section 
        });
        res.status(201).json(student);
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        res.status(400);
        return next(new Error('Error creating student: ' + error.message));
      }
    } else {
      res.status(400); 
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    // Update student fields
    student.department = req.body.department || student.department;
    student.semester = req.body.semester || student.semester;
    student.section = req.body.section || student.section;
    student.registerNumber = req.body.registerNumber || student.registerNumber;
    const updatedStudent = await student.save();

    // Update associated user fields
    const user = await User.findById(student.userId);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      await user.save();
    }
    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    // Remove both the student and the associated user account
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.id);
    
    // Also clean up any results for this student
    await Result.deleteMany({ studentId: req.params.id });

    res.json({ message: 'Student and all associated records removed successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Subject & Department Management ---

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

const addSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectCode, semester, department } = req.body;
    const subject = await Subject.create({ subjectName, subjectCode, semester, department });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (subject) {
      await Subject.findByIdAndDelete(req.params.id);
      res.json({ message: 'Subject removed' });
    } else {
      res.status(404); 
      return next(new Error('Subject not found'));
    }
  } catch (error) {
    next(error);
  }
};

// --- Announcements ---

const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

const addAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetAudience } = req.body;
    const announcement = await Announcement.create({
      title, message, targetAudience, author: req.user._id
    });

    // Create notifications for target audience
    let recipients = [];
    if (targetAudience === 'all') {
      recipients = await User.find({ role: { $in: ['teacher', 'student', 'head'] }, _id: { $ne: req.user._id } });
    } else if (targetAudience === 'teachers') {
      recipients = await User.find({ role: 'teacher' });
    } else if (targetAudience === 'students') {
      recipients = await User.find({ role: 'student' });
    }

    const notifications = recipients.map(user => ({
      recipient: user._id,
      title: `New Announcement: ${title}`,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      type: 'announcement'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (announcement) {
      await Announcement.findByIdAndDelete(req.params.id);
      res.json({ message: 'Announcement removed' });
    } else {
      res.status(404); 
      return next(new Error('Announcement not found'));
    }
  } catch (error) {
    next(error);
  }
};

// --- Specialized Features ---

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
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $lookup: { from: 'users', localField: 'student.userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ]);
    res.json(toppers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getTeachers, addTeacher, updateTeacher, deleteTeacher,
  getStudents, addStudent, updateStudent, deleteStudent,
  getSubjects, addSubject, deleteSubject,
  getAnnouncements, addAnnouncement, deleteAnnouncement,
  getToppers
};
