const express = require('express');
const { getMyResults, getMyProfile, getMyCurriculum } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin', 'head'));

router.get('/results', getMyResults);
router.get('/profile', getMyProfile);
router.get('/curriculum', getMyCurriculum);

module.exports = router;
