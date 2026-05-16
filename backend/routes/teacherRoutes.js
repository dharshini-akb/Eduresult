const express = require('express');
const {
  updateMarks,
  getMySubjects,
  getStudentsForMarks,
  getSubjectAnalytics,
  publishResults,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'head', 'admin'));

router.get('/subjects', getMySubjects);
router.get('/students-for-marks', getStudentsForMarks);
router.post('/marks', updateMarks);
router.get('/analytics', getSubjectAnalytics);
router.post('/publish', publishResults);

module.exports = router;
