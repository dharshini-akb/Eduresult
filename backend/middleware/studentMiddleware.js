const Student = require('../models/Student');

const attachStudent = async (req, res, next) => {
  const student = await Student.findOne({ userId: req.user._id }).populate(
    'userId',
    'name email profileImage phone'
  );

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  req.student = student;
  next();
};

module.exports = { attachStudent };
