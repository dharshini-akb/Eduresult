const express = require('express');
const {
  getAdminStats,
  getTeachers, addTeacher, updateTeacher, deleteTeacher,
  getStudents, addStudent, updateStudent, deleteStudent,
  getSubjects, addSubject, deleteSubject,
  getAnnouncements, addAnnouncement, deleteAnnouncement,
  getToppers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'head'));

router.get('/stats', getAdminStats);

// Teacher routes
router.route('/teachers').get(getTeachers).post(addTeacher);
router.route('/teachers/:id').put(updateTeacher).delete(deleteTeacher);

// Student routes
router.route('/students').get(getStudents).post(addStudent);
router.route('/students/:id').put(updateStudent).delete(deleteStudent);

// Subject routes
router.route('/subjects').get(getSubjects).post(addSubject);
router.route('/subjects/:id').delete(deleteSubject);

// Announcement routes
router.route('/announcements').get(getAnnouncements).post(addAnnouncement);
router.route('/announcements/:id').delete(deleteAnnouncement);

// Specialized routes
router.get('/toppers', getToppers);

module.exports = router;
