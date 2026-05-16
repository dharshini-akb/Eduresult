const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('./models/Subject');

dotenv.config();

const curriculum = [
  {
    semester: 1,
    subjects: [
      { name: 'Basic Engineering Foundation', code: 'BEF101' },
      { name: 'Engineering Mathematics I', code: 'MAT101' },
      { name: 'Engineering Physics', code: 'PHY101' },
      { name: 'Engineering Chemistry', code: 'CHE101' },
      { name: 'Problem Solving using C', code: 'CSE101' },
      { name: 'English Communication', code: 'ENG101' },
      { name: 'Engineering Graphics', code: 'ME101' },
      { name: 'Physics / Chemistry Lab', code: 'LAB101' },
      { name: 'C Programming Lab', code: 'LAB102' }
    ]
  },
  {
    semester: 2,
    subjects: [
      { name: 'Programming & Electronics Basics', code: 'BEF201' },
      { name: 'Engineering Mathematics II', code: 'MAT201' },
      { name: 'Python Programming', code: 'CSE201' },
      { name: 'Basic Electrical & Electronics Engineering', code: 'EEE201' },
      { name: 'Digital Principles', code: 'ECE201' },
      { name: 'Environmental Science', code: 'ENV201' },
      { name: 'Data Structures Basics', code: 'CSE202' },
      { name: 'Python Lab', code: 'LAB201' },
      { name: 'Digital Electronics Lab', code: 'LAB202' }
    ]
  },
  {
    semester: 3,
    subjects: [
      { name: 'Discrete Mathematics', code: 'MAT301' },
      { name: 'Data Structures and Algorithms', code: 'CSE301' },
      { name: 'Object Oriented Programming using Java', code: 'CSE302' },
      { name: 'Database Management Systems', code: 'CSE303' },
      { name: 'Computer Organization and Architecture', code: 'CSE304' },
      { name: 'Java Lab', code: 'LAB301' },
      { name: 'DBMS Lab', code: 'LAB302' }
    ]
  },
  {
    semester: 4,
    subjects: [
      { name: 'Operating Systems', code: 'CSE401' },
      { name: 'Computer Networks', code: 'CSE402' },
      { name: 'Software Engineering', code: 'CSE403' },
      { name: 'Design and Analysis of Algorithms', code: 'CSE404' },
      { name: 'Web Technology', code: 'CSE405' },
      { name: 'OS Lab', code: 'LAB401' },
      { name: 'Web Development Lab', code: 'LAB402' }
    ]
  },
  {
    semester: 5,
    subjects: [
      { name: 'Theory of Computation', code: 'CSE501' },
      { name: 'Computer Networks Advanced', code: 'CSE502' },
      { name: 'Mobile Application Development', code: 'CSE503' },
      { name: 'Cloud Computing', code: 'CSE504' },
      { name: 'Artificial Intelligence', code: 'CSE505' },
      { name: 'Mini Project', code: 'PROJ501' },
      { name: 'Mobile App Lab', code: 'LAB501' },
      { name: 'Cloud Lab', code: 'LAB502' }
    ]
  },
  {
    semester: 6,
    subjects: [
      { name: 'Machine Learning', code: 'CSE601' },
      { name: 'Cyber Security', code: 'CSE602' },
      { name: 'Internet of Things (IoT)', code: 'CSE603' },
      { name: 'Data Mining & Warehousing', code: 'CSE604' },
      { name: 'Compiler Design', code: 'CSE605' },
      { name: 'ML Lab', code: 'LAB601' },
      { name: 'Security Lab', code: 'LAB602' },
      { name: 'Internship / Industrial Training', code: 'INT601' }
    ]
  },
  {
    semester: 7,
    subjects: [
      { name: 'Big Data Analytics', code: 'CSE701' },
      { name: 'DevOps', code: 'CSE702' },
      { name: 'Blockchain Technology', code: 'CSE703' },
      { name: 'Full Stack Development', code: 'CSE704' },
      { name: 'Deep Learning', code: 'ELE701' },
      { name: 'Natural Language Processing', code: 'ELE702' },
      { name: 'Ethical Hacking', code: 'ELE703' },
      { name: 'AR/VR', code: 'ELE704' },
      { name: 'Robotics', code: 'ELE705' },
      { name: 'Data Science', code: 'ELE706' },
      { name: 'Major Project Phase I', code: 'PROJ701' },
      { name: 'Seminar', code: 'SEM701' }
    ]
  },
  {
    semester: 8,
    subjects: [
      { name: 'Major Project Phase II', code: 'PROJ801' },
      { name: 'Project Viva', code: 'VIVA801' },
      { name: 'Professional Ethics', code: 'ETH801' },
      { name: 'Entrepreneurship Development', code: 'ENT801' }
    ]
  }
];

const seedCurriculum = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Curriculum Seeding...');

    // Optionally clear existing subjects if you want a fresh start
    // await Subject.deleteMany({});

    for (const semData of curriculum) {
      for (const sub of semData.subjects) {
        // Use findOneAndUpdate with upsert to avoid duplicates
        await Subject.findOneAndUpdate(
          { subjectCode: sub.code },
          {
            subjectName: sub.name,
            subjectCode: sub.code,
            semester: semData.semester,
            department: 'Computer Science', // Default department
            credits: Math.floor(Math.random() * 3) + 2 // Random credits between 2-4
          },
          { upsert: true, new: true }
        );
      }
      console.log(`Semester ${semData.semester} subjects seeded.`);
    }

    console.log('Curriculum Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding curriculum: ${error.message}`);
    process.exit(1);
  }
};

seedCurriculum();
