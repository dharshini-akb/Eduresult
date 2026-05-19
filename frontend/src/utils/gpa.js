export const GRADE_OPTIONS = [
  { label: 'O', value: 10 },
  { label: 'A+', value: 9 },
  { label: 'A', value: 8 },
  { label: 'B+', value: 7 },
  { label: 'B', value: 6 },
  { label: 'C', value: 5 },
  { label: 'F', value: 0 },
];

export const GRADE_POINTS = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  F: 0,
};

export const getGradePoint = (result) => {
  if (result?.GPA > 0) return result.GPA;
  return GRADE_POINTS[result?.grade] ?? 0;
};

export const getCredits = (result) => result?.subjectId?.credits || 3;

export const calculateCGPA = (results = []) => {
  let totalCredits = 0;
  let totalGradePoints = 0;

  results.forEach((r) => {
    const credits = getCredits(r);
    const points = getGradePoint(r);
    totalCredits += credits;
    totalGradePoints += points * credits;
  });

  return totalCredits > 0
    ? (totalGradePoints / totalCredits).toFixed(2)
    : '0.00';
};

export const getStandingLabel = (cgpa) => {
  const value = parseFloat(cgpa);
  if (value >= 9) return 'Outstanding';
  if (value >= 8) return 'Excellent';
  if (value >= 7) return 'Very Good';
  if (value >= 6) return 'Good';
  if (value > 0) return 'Satisfactory';
  return 'No results yet';
};

export const getProfileImageUrl = (path, name = 'Student') => {
  if (path && path.startsWith('/uploads') && !path.includes('default-profile')) return path;
  if (path && path.startsWith('http')) return path;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=256`;
};

export const loadImageAsDataUrl = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = reject;
    img.src = url;
  });
