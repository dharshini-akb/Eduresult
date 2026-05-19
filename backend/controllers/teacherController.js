const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Result = require('../models/Result');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const MarkBatchStatus = require('../models/MarkBatchStatus');
const {
  getDepartmentQuery,
  departmentMatches,
  getSubjectsForDepartment,
} = require('../utils/departmentUtils');
const {
  INTERNAL_MAX,
  EXTERNAL_MAX,
  recalculateResult,
  checkAllStudentsHaveInternal,
  ensureInternalSubmitted,
} = require('../utils/markWorkflowUtils');
const {
  notifyStudentsResultsPublished,
  notifyTeachersResultsPublished,
} = require('../utils/notifyUtils');

const getTeacherByUser = async (userId) => {
  const teacher = await Teacher.findOne({ userId });
  if (!teacher) {
    const err = new Error('Teacher profile not found');
    err.status = 404;
    throw err;
  }
  return teacher;
};

const assertTeacherSubjectAccess = async (userId, subjectId) => {
  const teacher = await getTeacherByUser(userId);
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    const err = new Error('Subject not found');
    err.status = 404;
    throw err;
  }
  if (!departmentMatches(subject.department, teacher.department)) {
    const err = new Error(
      `You can only enter marks for ${teacher.department} department subjects`
    );
    err.status = 403;
    throw err;
  }
  return { teacher, subject };
};

const buildStudentQueryForSubject = (subject, semester, teacherDepartment) => {
  const sem = parseInt(semester, 10);
  const query = {};

  // For Semester 1 Common subjects, we include everyone
  if (sem === 1 && subject.department === 'Common') {
    return query;
  }

  const deptForStudents =
    subject.department === 'Common' ? teacherDepartment : subject.department;
  query.department = { $in: getDepartmentQuery(deptForStudents) };
  return query;
};

const getBatchStatus = async (subjectId, semester) =>
  MarkBatchStatus.findOne({ subjectId, semester: parseInt(semester, 10) });

const getTeacherProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'head' || user.role === 'admin') {
    return res.json({
      user,
      role: user.role,
      department: null,
    });
  }

  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher profile not found');
  }

  res.json({
    user,
    employeeId: teacher.employeeId,
    department: teacher.department,
    assignedSubjectCount: teacher.subjects?.length || 0,
  });
};

const updateTeacherProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name) user.name = req.body.name.trim();
  if (req.body.email) user.email = req.body.email.trim().toLowerCase();
  if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

  if (req.file) {
    // Delete old profile image if it exists
    if (user.profileImage && user.profileImage.startsWith('/uploads/profiles/')) {
      const oldPath = path.join(__dirname, '..', user.profileImage.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Error deleting old profile image:', err);
        }
      }
    }
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
  }

  await user.save();

  // For teachers, also allow updating department/employeeId if provided (optional, but keep it consistent with admin update if needed)
  if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userId: user._id });
    if (teacher) {
      if (req.body.department) teacher.department = req.body.department;
      if (req.body.employeeId) teacher.employeeId = req.body.employeeId;
      await teacher.save();
    }
  }

  const updatedUser = await User.findById(user._id).select('-password');
  
  let responseData = { user: updatedUser };
  if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userId: user._id });
    responseData = {
      ...responseData,
      employeeId: teacher.employeeId,
      department: teacher.department,
    };
  }

  res.json(responseData);
};

const updateMarks = async (req, res) => {
  const { studentId, subjectId, marks, type, semester, remarks } = req.body;
  const role = req.user.role;
  const numericMarks = Number(marks);

  if (Number.isNaN(numericMarks) || numericMarks < 0) {
    res.status(400);
    throw new Error('Invalid marks value');
  }

  const sem = parseInt(semester, 10);
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  let teacherDepartment = subject.department;
  if (role === 'teacher') {
    if (type !== 'internal') {
      res.status(403);
      throw new Error('Teachers can only enter internal marks');
    }
    const { teacher } = await assertTeacherSubjectAccess(req.user._id, subjectId);
    teacherDepartment = teacher.department;
  } else if (role === 'head' || role === 'admin') {
    if (type !== 'external') {
      res.status(403);
      throw new Error('Head/Admin posts external marks only');
    }
  } else {
    res.status(403);
    throw new Error('Not authorized to enter marks');
  }

  const studentQuery = buildStudentQueryForSubject(subject, sem, teacherDepartment);
  let batch = await getBatchStatus(subjectId, sem);

  if (role === 'teacher' && batch?.internalSubmitted) {
    res.status(400);
    throw new Error('Internal marks already sent to Head. Contact admin for changes.');
  }

  if (role === 'head' || role === 'admin') {
    const internalReady = await ensureInternalSubmitted(subject, sem, studentQuery, {
      notify: true,
    });
    batch = internalReady.batch;
    if (batch?.published) {
      res.status(400);
      throw new Error('Results already published for this subject');
    }
  }

  let result = await Result.findOne({ studentId, subjectId, semester: sem });

  if (!result) {
    result = new Result({
      studentId,
      subjectId,
      semester: sem,
      internalMarks: 0,
      externalMarks: 0,
      total: 0,
      percentage: 0,
      grade: 'N/A',
      GPA: 0,
      status: 'Fail',
      internalStatus: 'Fail',
      published: false,
    });
  }

  if (type === 'internal') {
    if (numericMarks > INTERNAL_MAX) {
      res.status(400);
      throw new Error(`Internal marks cannot exceed ${INTERNAL_MAX}`);
    }
    result.internalMarks = numericMarks;
  } else {
    if (numericMarks > EXTERNAL_MAX) {
      res.status(400);
      throw new Error(`External marks cannot exceed ${EXTERNAL_MAX}`);
    }
    const existing = await Result.findOne({ studentId, subjectId, semester: sem });
    if (existing?.internalStatus === 'Fail') {
      res.status(400);
      throw new Error('Student failed internal (< 20). External marks not required.');
    }
    result.externalMarks = numericMarks;
  }

  if (remarks) result.remarks = remarks;
  recalculateResult(result);
  result.published = false;
  await result.save();

  if (role === 'teacher') {
    await ensureInternalSubmitted(subject, sem, studentQuery, {
      submittedBy: req.user,
      notify: true,
    });
  }

  res.json(result);
};

const submitInternalMarks = async (req, res) => {
  const { subjectId, semester } = req.body;

  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Only teachers can submit internal marks');
  }

  const { teacher, subject } = await assertTeacherSubjectAccess(req.user._id, subjectId);
  const sem = parseInt(semester, 10);
  const studentQuery = buildStudentQueryForSubject(subject, sem, teacher.department);
  const { complete, studentCount } = await checkAllStudentsHaveInternal(
    subjectId,
    sem,
    studentQuery
  );

  if (!complete) {
    res.status(400);
    throw new Error(
      `Enter internal marks for all ${studentCount} students before submitting to Head`
    );
  }

  const { batch, justSubmitted } = await ensureInternalSubmitted(subject, sem, studentQuery, {
    submittedBy: req.user,
    notify: true,
  });

  res.json({
    message: justSubmitted
      ? 'Internal marks submitted. Head & Admin have been notified.'
      : 'Internal marks were already submitted to Head',
    batch,
  });
};

const getMySubjects = async (req, res) => {
  const { role } = req.user;

  if (role === 'head' || role === 'admin') {
    const { department } = req.query;
    const subjects = department
      ? await getSubjectsForDepartment(Subject, department)
      : await Subject.find().sort({ semester: 1, subjectName: 1 }).lean();

    const batches = await MarkBatchStatus.find({
      internalSubmitted: true,
      published: false,
    }).populate('subjectId', 'subjectName subjectCode semester department');

    return res.json({
      department: department || null,
      subjects,
      filterByDepartment: Boolean(department),
      pendingExternal: batches,
    });
  }

  const teacher = await getTeacherByUser(req.user._id);
  const subjects = await getSubjectsForDepartment(Subject, teacher.department);

  const batches = await MarkBatchStatus.find({
    subjectId: { $in: subjects.map((s) => s._id) },
  });
  const batchMap = Object.fromEntries(
    batches.map((b) => [`${b.subjectId}-${b.semester}`, b])
  );

  const subjectsWithStatus = subjects.map((s) => ({
    ...s,
    markStatus: batchMap[`${s._id}-${s.semester}`] || null,
  }));

  res.json({
    department: teacher.department,
    subjects: subjectsWithStatus,
    filterByDepartment: true,
  });
};

const getStudentsForMarks = async (req, res) => {
  const { semester, subjectId } = req.query;
  let { department } = req.query;

  if (!semester || !subjectId) {
    res.status(400);
    throw new Error('Semester and Subject are required');
  }

  const sem = parseInt(semester, 10);
  let subject = await Subject.findById(subjectId);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  let teacherDepartment = department || subject.department;

  if (req.user.role === 'teacher') {
    const { teacher, subject: allowedSubject } = await assertTeacherSubjectAccess(
      req.user._id,
      subjectId
    );
    subject = allowedSubject;
    teacherDepartment = teacher.department;
    department = teacher.department;
  } else if (!department) {
    department = subject.department;
    teacherDepartment = subject.department;
  }

  const studentQuery = buildStudentQueryForSubject(subject, sem, teacherDepartment || department);
  const students = await Student.find(studentQuery).populate('userId', 'name');
  const results = await Result.find({ subjectId, semester: sem });

  const { batch, allInternalComplete } = await ensureInternalSubmitted(
    subject,
    sem,
    studentQuery,
    {
      notify: true,
      submittedBy: req.user.role === 'teacher' ? req.user : null,
    }
  );

  const studentData = students.map((student) => {
    const result = results.find((r) => r.studentId.toString() === student._id.toString());
    return {
      _id: student._id,
      name: student.userId?.name || 'Unknown',
      registerNumber: student.registerNumber,
      department: student.department,
      marks: result
        ? {
            internal: result.internalMarks,
            external: result.externalMarks,
            total: result.total,
            grade: result.grade,
            status: result.status,
            internalStatus: result.internalStatus || (result.internalMarks >= 20 ? 'Pass' : 'Fail'),
            published: result.published,
          }
        : null,
    };
  });

  res.json({
    students: studentData,
    batchStatus: {
      internalSubmitted: Boolean(batch?.internalSubmitted || allInternalComplete),
      published: Boolean(batch?.published),
      headNotified: Boolean(batch?.headNotified),
    },
    studentCount: students.length,
    internalEnteredCount: results.filter((r) => r.internalMarks !== undefined && r.internalMarks !== null).length,
    externalEnteredCount: results.filter((r) => r.externalMarks !== undefined && r.externalMarks !== null).length,
    allInternalComplete,
  });
};

const getSubjectAnalytics = async (req, res) => {
  const { subjectId, semester } = req.query;
  if (req.user.role === 'teacher') {
    await assertTeacherSubjectAccess(req.user._id, subjectId);
  }
  const results = await Result.find({ subjectId, semester });
  const batch = await getBatchStatus(subjectId, semester);
  res.json({
    total: results.length,
    passed: results.filter((r) => r.status === 'Pass').length,
    failed: results.filter((r) => r.status === 'Fail').length,
    avgMarks: results.reduce((acc, curr) => acc + curr.total, 0) / (results.length || 1),
    batchStatus: batch,
  });
};

const publishResults = async (req, res) => {
  const { semester, subjectId } = req.body;

  if (req.user.role !== 'head' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only Head or Admin can publish results');
  }

  if (!subjectId || !semester) {
    res.status(400);
    throw new Error('Subject and semester are required');
  }

  const subject = await Subject.findById(subjectId);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const sem = parseInt(semester || subject.semester, 10);
  const studentQuery = buildStudentQueryForSubject(subject, sem, subject.department);
  const { batch } = await ensureInternalSubmitted(subject, sem, studentQuery, {
    notify: false,
  });

  if (batch?.published) {
    res.status(400);
    throw new Error('Results already published for this subject');
  }

  const results = await Result.find({ subjectId, semester: sem });
  const students = await Student.find(studentQuery).select('_id');
  const allExternalEntered = students.every((student) => {
    const row = results.find((r) => r.studentId.toString() === student._id.toString());
    return row && row.externalMarks !== undefined && row.externalMarks !== null;
  });

  if (!allExternalEntered) {
    res.status(400);
    throw new Error(
      `Enter external marks for all ${students.length} students before publishing`
    );
  }

  await Result.updateMany({ subjectId, semester: sem }, { published: true });

  await MarkBatchStatus.findOneAndUpdate(
    { subjectId, semester: sem },
    {
      internalSubmitted: true,
      published: true,
      publishedBy: req.user._id,
      publishedAt: new Date(),
    },
    { upsert: true }
  );

  const enrolled = await Student.find(studentQuery).populate('userId', '_id');
  const userIds = enrolled.map((s) => s.userId?._id).filter(Boolean);
  await notifyStudentsResultsPublished(userIds, subject, sem);
  await notifyTeachersResultsPublished(subject, sem);

  res.json({
    message: 'Results published. Students can download marksheet when the semester is complete.',
    count: results.length,
  });
};

module.exports = {
  getTeacherProfile,
  updateTeacherProfile,
  updateMarks,
  submitInternalMarks,
  getMySubjects,
  getStudentsForMarks,
  getSubjectAnalytics,
  publishResults,
};
