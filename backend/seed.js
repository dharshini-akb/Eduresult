const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Result = require('./models/Result');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data (but keep subjects we seeded earlier)
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    // await Subject.deleteMany(); // Keep the subjects from seedFullCurriculum
    await Result.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });

    // Create Teacher
    const teacherUser = await User.create({
      name: 'John Doe',
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher',
    });

    const teacher = await Teacher.create({
      userId: teacherUser._id,
      employeeId: 'T101',
      department: 'Computer Science',
    });

    // IT department teacher (mark entry: Information Technology subjects only)
    const itTeacherUser = await User.create({
      name: 'IT Faculty',
      email: 'it.teacher@test.com',
      password: 'password123',
      role: 'teacher',
    });
    await Teacher.create({
      userId: itTeacherUser._id,
      employeeId: 'T-IT-01',
      department: 'Information Technology',
    });

    // Create Student
    const studentUser = await User.create({
      name: 'Jane Smith',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
    });

    const student = await Student.create({
      userId: studentUser._id,
      registerNumber: '23ITR001',
      department: 'Information Technology',
      semester: 1,
      section: 'A',
    });

    // Create Head Faculty
    await User.create({
      name: 'Head Faculty',
      email: 'head@test.com',
      password: 'password123',
      role: 'head',
    });

    // Create Subjects (Get from the ones we just seeded or create sample ones)
    const itSub = await Subject.findOne({ department: 'Information Technology', semester: 1 });
    const sub1 = itSub || await Subject.create({
      subjectName: 'Mathematics',
      subjectCode: 'MA101',
      semester: 1,
      department: 'Information Technology',
    });

    const itSub2 = await Subject.findOne({ department: 'Information Technology', semester: 1, subjectCode: { $ne: sub1.subjectCode } });
    const sub2 = itSub2 || await Subject.create({
      subjectName: 'Physics',
      subjectCode: 'PH101',
      semester: 1,
      department: 'Information Technology',
    });

    // Create Results
    await Result.create({
      studentId: student._id,
      subjectId: sub1._id,
      internalMarks: 25,
      externalMarks: 65,
      total: 90,
      percentage: 90,
      grade: 'A+',
      GPA: 10,
      status: 'Pass',
      remarks: 'Excellent',
      published: true,
      semester: 1,
    });

    await Result.create({
      studentId: student._id,
      subjectId: sub2._id,
      internalMarks: 22,
      externalMarks: 58,
      total: 80,
      percentage: 80,
      grade: 'A',
      GPA: 9,
      status: 'Pass',
      remarks: 'Good',
      published: true,
      semester: 1,
    });

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(seedData);
