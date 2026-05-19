const express = require('express');
const {
  getMyResults,
  getMyProfile,
  getMyCurriculum,
  getDashboard,
  updateMyProfile,
  getToppers,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { attachStudent } = require('../middleware/studentMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin', 'head'));
router.use(attachStudent);

router.get('/dashboard', getDashboard);
router.get('/results', getMyResults);
router.get('/curriculum', getMyCurriculum);
router.get('/toppers', getToppers);

router.route('/profile')
  .get(getMyProfile)
  .put(uploadProfile.single('profileImage'), updateMyProfile);

module.exports = router;
