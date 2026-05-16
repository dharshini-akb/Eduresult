const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Result = require('../models/Result');
const Teacher = require('../models/Teacher');

// @desc    Update marks (Internal by Teacher, External by Head)
// @route   POST /api/teacher/marks
// @access  Private/Teacher or Head
const updateMarks = async (req, res) => {
  const { studentId, subjectId, marks, type, semester, remarks } = req.body;
  const role = req.user.role;

  let result = await Result.findOne({ studentId, subjectId, semester });

  if (!result) {
    // If no result exists yet, create one with default values
    result = new Result({
      studentId,
      subjectId,
      semester,
      internalMarks: 0,
      externalMarks: 0,
      total: 0,
      percentage: 0,
      grade: 'N/A',
      GPA: 0,
      status: 'Fail',
      published: false
    });
  }

  // Permission Logic: Head can do both (Internal/External), Teacher only internal
  if (role === 'head' || role === 'admin') {
    if (type === 'internal') result.internalMarks = marks;
    else result.externalMarks = marks;
  } else if (role === 'teacher') {
    if (type !== 'internal') {
      res.status(403); throw new Error('Teacher can only assign internal marks');
    }
    result.internalMarks = marks;
  }

  // Update remarks if provided
  if (remarks) result.remarks = remarks;

  // Recalculate Totals & Grades
  result.total = result.internalMarks + result.externalMarks;
  result.percentage = (result.total / 100) * 100; // Assuming 100 total

  // Grade Logic based on user request: O(10), A+(9), A(8), B+(7), B(6), C(5), F(0)
  if (result.percentage >= 91) { result.grade = 'O'; result.GPA = 10; }
  else if (result.percentage >= 81) { result.grade = 'A+'; result.GPA = 9; }
  else if (result.percentage >= 71) { result.grade = 'A'; result.GPA = 8; }
  else if (result.percentage >= 61) { result.grade = 'B+'; result.GPA = 7; }
  else if (result.percentage >= 51) { result.grade = 'B'; result.GPA = 6; }
  else if (result.percentage === 50) { result.grade = 'C'; result.GPA = 5; }
  else { result.grade = 'F'; result.GPA = 0; }

  result.status = result.percentage >= 50 ? 'Pass' : 'Fail';

  await result.save();
  res.json(result);
};

// @desc    Get teacher subjects
const getMySubjects = async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id }).populate('subjects');
  
  // If teacher has assigned subjects, return them. 
  // Otherwise, return all subjects so they can "load the subjects" and select.
  if (teacher && teacher.subjects && teacher.subjects.length > 0) {
    res.json(teacher.subjects);
  } else {
    // If no subjects assigned or no profile, show all subjects
    const subjects = await Subject.find().sort({ semester: 1, subjectName: 1 });
    res.json(subjects);
  }
};

// @desc    Get students for mark entry
const getStudentsForMarks = async (req, res) => {
  const { department, semester, subjectId } = req.query;
  
  if (!department || !semester) {
    res.status(400);
    throw new Error('Department and Semester are required');
  }

  const sem = parseInt(semester);
  const dept = department.trim();

  // Handle common aliases for department matching
  let deptQuery = [dept];
  if (dept.toLowerCase() === 'computer science' || dept.toLowerCase() === 'cse') {
    deptQuery = ['Computer Science', 'cse', 'CSE', 'COMPUTER SCIENCE'];
  } else if (dept.toLowerCase() === 'it' || dept.toLowerCase() === 'information technology') {
    deptQuery = ['IT', 'Information Technology', 'it', 'INFORMATION TECHNOLOGY'];
  }

  // Build query object
  let query = {
    semester: sem
  };

  // For Semester 1, subjects are often common across departments. 
  // We show all students of the semester to ensure no one is missed.
  // For other semesters, we filter by the subject's department.
  if (sem !== 1) {
    query.department = { $in: deptQuery };
  }

  const students = await Student.find(query).populate('userId', 'name');
  
  // Also fetch existing marks if any
  const results = await Result.find({ subjectId, semester: sem });
  
  const studentData = students.map(student => {
    const result = results.find(r => r.studentId.toString() === student._id.toString());
    return {
      _id: student._id,
      name: student.userId.name,
      registerNumber: student.registerNumber,
      marks: result ? {
        internal: result.internalMarks,
        external: result.externalMarks,
        total: result.total,
        grade: result.grade,
        status: result.status
      } : null
    };
  });

  res.json(studentData);
};

// @desc    Get analytics for a subject
const getSubjectAnalytics = async (req, res) => {
  const { subjectId, semester } = req.query;
  const results = await Result.find({ subjectId, semester });
  
  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'Pass').length,
    failed: results.filter(r => r.status === 'Fail').length,
    avgMarks: results.reduce((acc, curr) => acc + curr.total, 0) / (results.length || 1)
  };

  res.json(stats);
};

const publishResults = async (req, res) => {
  const { semester, department } = req.body;
  
  // For Semester 1, we want to publish for all departments since subjects are common
  let query = { semester };
  if (parseInt(semester) !== 1) {
    const students = await Student.find({ department, semester });
    const studentIds = students.map(s => s._id);
    query.studentId = { $in: studentIds };
  }

  await Result.updateMany(query, { published: true });

  res.json({ message: 'Results published successfully' });
};

module.exports = {
  updateMarks,
  getMySubjects,
  getStudentsForMarks,
  getSubjectAnalytics,
  publishResults,
};
