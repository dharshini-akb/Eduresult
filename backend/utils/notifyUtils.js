const Notification = require('../models/Notification');
const User = require('../models/User');

const notifyUsers = async (userIds, { title, message, type = 'system', meta }) => {
  const uniqueIds = [...new Set(userIds.map((id) => id.toString()))];
  if (!uniqueIds.length) return;

  await Notification.insertMany(
    uniqueIds.map((recipient) => ({
      recipient,
      title,
      message,
      type,
      ...(meta ? { meta } : {}),
    }))
  );
};

/** Notify head of department and admin when teacher submits internal marks */
const notifyHeadsInternalSubmitted = async (subject, semester, teacherUser) => {
  const recipients = await User.find({ role: { $in: ['head', 'admin'] } }).select('_id');
  if (!recipients.length) return;

  const teacherName = teacherUser?.name || 'A teacher';
  await notifyUsers(
    recipients.map((u) => u._id),
    {
      title: 'Internal marks ready for external entry',
      message: `${teacherName} posted internal marks for ${subject.subjectName} (Semester ${semester}). Please enter external marks (out of 60) and publish results.`,
      type: 'marks',
      meta: { subjectId: subject._id, semester },
    }
  );
};

const notifyStudentsResultsPublished = async (studentUserIds, subject, semester) => {
  if (!studentUserIds.length) return;
  await notifyUsers(studentUserIds, {
    title: 'Results Published',
    message: `The results for ${subject.subjectName} (Semester ${semester}) have been published. You can now view your marks and download the marksheet.`,
    type: 'result',
    meta: { subjectId: subject._id, semester },
  });
};

const notifyTeachersResultsPublished = async (subject, semester) => {
  // Find teachers assigned to this subject OR all teachers in the same department
  const recipients = await User.find({ role: 'teacher' }).select('_id');
  if (!recipients.length) return;

  await notifyUsers(
    recipients.map((u) => u._id),
    {
      title: 'Results published',
      message: `Results for ${subject.subjectName} (Semester ${semester}) have been published by the Head.`,
      type: 'result',
      meta: { subjectId: subject._id, semester },
    }
  );
};

module.exports = {
  notifyUsers,
  notifyHeadsInternalSubmitted,
  notifyStudentsResultsPublished,
  notifyTeachersResultsPublished,
};
