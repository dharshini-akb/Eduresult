const GRADE_POINTS = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  F: 0,
};

const assignGradeFromPercentage = (percentage) => {
  if (percentage >= 91) return { grade: 'O', GPA: 10 };
  if (percentage >= 81) return { grade: 'A+', GPA: 9 };
  if (percentage >= 71) return { grade: 'A', GPA: 8 };
  if (percentage >= 61) return { grade: 'B+', GPA: 7 };
  if (percentage >= 51) return { grade: 'B', GPA: 6 };
  if (percentage >= 50) return { grade: 'C', GPA: 5 };
  return { grade: 'F', GPA: 0 };
};

const getGradePoint = (grade, gpa) => {
  if (typeof gpa === 'number' && gpa > 0) return gpa;
  return GRADE_POINTS[grade] ?? 0;
};

const calculateCGPA = (results, getCredits = (r) => r.subjectId?.credits || 3) => {
  let totalCredits = 0;
  let totalGradePoints = 0;

  results.forEach((r) => {
    const credits = getCredits(r) || 0;
    if (credits <= 0) return;
    const points = getGradePoint(r.grade, r.GPA);
    totalCredits += credits;
    totalGradePoints += points * credits;
  });

  return totalCredits > 0
    ? Number((totalGradePoints / totalCredits).toFixed(2))
    : 0;
};

module.exports = {
  GRADE_POINTS,
  assignGradeFromPercentage,
  getGradePoint,
  calculateCGPA,
};
