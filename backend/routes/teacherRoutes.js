const express = require('express');
const {
  getTeacherProfile,
  updateTeacherProfile,
  updateMarks,
  submitInternalMarks,
  getMySubjects,
  getStudentsForMarks,
  getSubjectAnalytics,
  publishResults,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'head', 'admin'));

router.route('/profile')
  .get(getTeacherProfile)
  .put(uploadProfile.single('profileImage'), updateTeacherProfile);

router.get('/subjects', getMySubjects);
router.get('/students-for-marks', getStudentsForMarks);
router.post('/marks', updateMarks);
router.post('/submit-internal', authorize('teacher'), submitInternalMarks);
router.get('/analytics', getSubjectAnalytics);
router.post('/publish', publishResults);

module.exports = router;
