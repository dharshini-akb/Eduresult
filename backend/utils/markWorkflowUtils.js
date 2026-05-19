const Student = require('../models/Student');
const Result = require('../models/Result');
const MarkBatchStatus = require('../models/MarkBatchStatus');
const { assignGradeFromPercentage } = require('./gradeUtils');
const { notifyHeadsInternalSubmitted } = require('./notifyUtils');

const INTERNAL_PASS_MARK = 20;
const INTERNAL_MAX = 40;
const EXTERNAL_MAX = 60;

const recalculateResult = (result) => {
  const internal = Number(result.internalMarks) || 0;
  const external = Number(result.externalMarks) || 0;

  result.internalStatus = internal >= INTERNAL_PASS_MARK ? 'Pass' : 'Fail';
  result.total = internal + external;
  result.percentage = result.total;

  if (internal < INTERNAL_PASS_MARK) {
    result.status = 'Fail';
    result.grade = 'F';
    result.GPA = 0;
    return result;
  }

  const { grade, GPA } = assignGradeFromPercentage(result.percentage);
  result.grade = grade;
  result.GPA = GPA;
  result.status = result.percentage >= 50 ? 'Pass' : 'Fail';
  return result;
};

const checkAllStudentsHaveInternal = async (subjectId, semester, studentQuery) => {
  const sem = parseInt(semester, 10);
  const students = await Student.find(studentQuery).select('_id');
  if (!students.length) return { complete: false, studentCount: 0 };

  const results = await Result.find({ subjectId, semester: sem });
  const complete = students.every((student) => {
    const row = results.find((r) => r.studentId.toString() === student._id.toString());
    return row && row.internalMarks !== undefined && row.internalMarks !== null;
  });

  return { complete, studentCount: students.length };
};

/**
 * When all students have internal marks, mark batch as submitted and notify head/admin once.
 */
const ensureInternalSubmitted = async (
  subject,
  semester,
  studentQuery,
  { submittedBy = null, notify = true } = {}
) => {
  const sem = parseInt(semester, 10);
  const { complete, studentCount } = await checkAllStudentsHaveInternal(
    subject._id,
    sem,
    studentQuery
  );

  if (!complete || studentCount === 0) {
    const existing = await MarkBatchStatus.findOne({ subjectId: subject._id, semester: sem });
    return { batch: existing, justSubmitted: false, allInternalComplete: false };
  }

  let batch = await MarkBatchStatus.findOne({ subjectId: subject._id, semester: sem });
  const wasSubmitted = batch?.internalSubmitted;
  const needsNotify = notify && !batch?.headNotified;

  if (!wasSubmitted) {
    batch = await MarkBatchStatus.findOneAndUpdate(
      { subjectId: subject._id, semester: sem },
      {
        internalSubmitted: true,
        internalSubmittedBy: submittedBy,
        internalSubmittedAt: new Date(),
        published: false,
        ...(needsNotify ? { headNotified: true } : {}),
      },
      { upsert: true, new: true }
    );
  } else if (needsNotify) {
    batch = await MarkBatchStatus.findOneAndUpdate(
      { subjectId: subject._id, semester: sem },
      { headNotified: true },
      { new: true }
    );
  }

  if (needsNotify) {
    const teacherUser = submittedBy?.name
      ? submittedBy
      : { name: 'Teacher' };
    await notifyHeadsInternalSubmitted(subject, sem, teacherUser);
  }

  return {
    batch,
    justSubmitted: !wasSubmitted,
    allInternalComplete: true,
  };
};

const isInternalSubmittedForSubject = async (subjectId, semester, studentQuery) => {
  const batch = await MarkBatchStatus.findOne({
    subjectId,
    semester: parseInt(semester, 10),
  });
  if (batch?.internalSubmitted) return true;

  const { complete } = await checkAllStudentsHaveInternal(subjectId, semester, studentQuery);
  return complete;
};

module.exports = {
  INTERNAL_PASS_MARK,
  INTERNAL_MAX,
  EXTERNAL_MAX,
  recalculateResult,
  checkAllStudentsHaveInternal,
  ensureInternalSubmitted,
  isInternalSubmittedForSubject,
};
