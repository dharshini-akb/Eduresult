const getDepartmentQuery = (dept) => {
  const trimmed = (dept || '').trim();
  const deptLower = trimmed.toLowerCase();

  if (deptLower.includes('computer science') || deptLower === 'cse') {
    return ['Computer Science', 'CSE', 'cse', 'COMPUTER SCIENCE', 'computer science'];
  }
  if (deptLower.includes('information technology') || deptLower === 'it') {
    return ['Information Technology', 'IT', 'it', 'INFORMATION TECHNOLOGY', 'information technology'];
  }
  if (deptLower.includes('mechanical') || deptLower === 'mech') {
    return ['Mechanical Engineering', 'Mechanical', 'MECH', 'mech', 'MECHANICAL'];
  }
  if (deptLower.includes('civil')) {
    return ['Civil Engineering', 'Civil', 'CIVIL', 'civil'];
  }
  if (deptLower.includes('electrical') || deptLower === 'eee') {
    return ['Electrical Engineering', 'Electrical', 'EEE', 'eee', 'ELECTRICAL'];
  }
  if (deptLower.includes('electronics') || deptLower === 'ece') {
    return ['Electronics Engineering', 'Electronics', 'ECE', 'ece', 'ELECTRONICS'];
  }
  if (deptLower === 'aids' || deptLower.includes('artificial intelligence')) {
    return ['AIDS', 'aids', 'Artificial Intelligence', 'Artificial Intelligence and Data Science'];
  }

  return [trimmed];
};

const buildDepartmentFilter = (department) => {
  const variants = getDepartmentQuery(department);
  const escaped = variants.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return {
    $or: [
      { department: { $in: variants } },
      { department: { $regex: new RegExp(`^(${escaped.join('|')})$`, 'i') } },
      { department: 'Common' },
    ],
  };
};

const departmentMatches = (deptA, deptB) => {
  if (!deptA || !deptB) return false;
  if (deptA === 'Common' || deptB === 'Common') return true;
  
  const variantsA = getDepartmentQuery(deptA).map(v => v.toLowerCase());
  const variantsB = getDepartmentQuery(deptB).map(v => v.toLowerCase());
  
  return variantsA.some(v => variantsB.includes(v));
};

const getSubjectsForDepartment = async (Subject, department) => {
  return Subject.find(buildDepartmentFilter(department))
    .select('subjectName subjectCode credits semester department')
    .sort({ semester: 1, subjectName: 1 })
    .lean();
};

const buildSemesterStatus = (subjects, results) => {
  const subjectsBySem = {};
  subjects.forEach((sub) => {
    const sem = sub.semester;
    if (!subjectsBySem[sem]) subjectsBySem[sem] = [];
    subjectsBySem[sem].push(sub);
  });

  const resultsBySem = {};
  results.forEach((r) => {
    const sem = r.semester;
    if (!resultsBySem[sem]) resultsBySem[sem] = [];
    resultsBySem[sem].push(r);
  });

  const semesters = new Set([
    ...Object.keys(subjectsBySem).map(Number),
    ...Object.keys(resultsBySem).map(Number),
  ]);

  const status = {};
  semesters.forEach((sem) => {
    const required = subjectsBySem[sem] || [];
    const semResults = resultsBySem[sem] || [];
    const resultSubjectIds = new Set(
      semResults
        .filter((r) => r.subjectId)
        .map((r) => (r.subjectId._id || r.subjectId).toString())
    );

    const matchedCount = required.filter((sub) =>
      resultSubjectIds.has(sub._id.toString())
    ).length;
    const totalSubjects = required.length;
    const publishedCount = semResults.length;

    // Prefer subject-level matching; fall back to published result count
    // when subject references are missing (e.g. deleted subjects).
    const enteredCount =
      matchedCount > 0 ? matchedCount : publishedCount;
    // Marksheet: every subject must have published results with external marks entered
    const publishedWithExternal = semResults.filter(
      (r) =>
        r.published &&
        r.externalMarks !== undefined &&
        r.externalMarks !== null &&
        r.subjectId
    );
    const publishedSubjectIds = new Set(
      publishedWithExternal.map((r) => (r.subjectId._id || r.subjectId).toString())
    );
    const subjectsReady =
      totalSubjects > 0 &&
      required.some((sub) => publishedSubjectIds.has(sub._id.toString()));

    status[sem] = {
      totalSubjects,
      enteredCount,
      canDownload: subjectsReady,
      publishedCount: publishedSubjectIds.size,
    };
  });

  return status;
};

module.exports = {
  getDepartmentQuery,
  departmentMatches,
  buildDepartmentFilter,
  getSubjectsForDepartment,
  buildSemesterStatus,
};
