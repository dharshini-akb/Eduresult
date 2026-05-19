const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('./models/Subject');

dotenv.config();

const curriculumData = {
  "Computer Science": [
    { semester: 1, subjects: ["Engineering Mathematics I", "Engineering Physics", "Programming in C", "Engineering Graphics", "English Communication", "Physics Lab", "C Programming Lab"] },
    { semester: 2, subjects: ["Engineering Mathematics II", "Engineering Chemistry", "Basic Electrical Engineering", "Basic Electronics Engineering", "Python Programming", "Chemistry Lab", "Python Lab"] },
    { semester: 3, subjects: ["Data Structures", "Digital Logic Design", "Object Oriented Programming", "Discrete Mathematics", "Computer Organization", "Data Structures Lab", "OOP Lab"] },
    { semester: 4, subjects: ["Operating Systems", "Database Management Systems", "Design and Analysis of Algorithms", "Software Engineering", "Microprocessors", "DBMS Lab", "OS Lab"] },
    { semester: 5, subjects: ["Computer Networks", "Theory of Computation", "Web Technology", "Java Programming", "Artificial Intelligence", "CN Lab", "Web Technology Lab"] },
    { semester: 6, subjects: ["Compiler Design", "Machine Learning", "Cloud Computing", "Cryptography and Network Security", "Mobile Application Development", "ML Lab", "Cloud Lab"] },
    { semester: 7, subjects: ["Internet of Things", "Big Data Analytics", "DevOps", "Elective Subjects", "Project Work Phase 1"] },
    { semester: 8, subjects: ["Cyber Security", "Professional Ethics", "Elective Subjects", "Internship", "Major Project"] }
  ],
  "EEE": [
    { semester: 1, subjects: ["Engineering Mathematics I", "Engineering Physics", "Engineering Graphics", "Basic Electrical Engineering", "English Communication", "Physics Lab"] },
    { semester: 2, subjects: ["Engineering Mathematics II", "Engineering Chemistry", "Programming in C", "Electronic Devices", "Environmental Science", "Chemistry Lab", "C Lab"] },
    { semester: 3, subjects: ["Circuit Theory", "Electrical Machines I", "Digital Electronics", "Signals and Systems", "Electrical Measurements", "Circuit Lab"] },
    { semester: 4, subjects: ["Electrical Machines II", "Control Systems", "Analog Electronics", "Power Systems I", "Microprocessors", "Machines Lab", "Control Systems Lab"] },
    { semester: 5, subjects: ["Power Electronics", "Power Systems II", "Embedded Systems", "Transmission and Distribution", "Electrical Drives", "Power Electronics Lab"] },
    { semester: 6, subjects: ["Renewable Energy Systems", "High Voltage Engineering", "PLC and SCADA", "Smart Grid", "Industrial Automation", "PLC Lab"] },
    { semester: 7, subjects: ["Electric Vehicles", "Energy Management", "Elective Subjects", "Mini Project", "Internship"] },
    { semester: 8, subjects: ["Power System Protection", "Professional Ethics", "Major Project", "Electives"] }
  ],
  "AIDS": [
    { semester: 1, subjects: ["Engineering Mathematics I", "Engineering Physics", "Programming in C", "English Communication", "Engineering Graphics", "Physics Lab", "C Lab"] },
    { semester: 2, subjects: ["Engineering Mathematics II", "Python Programming", "Basic Electrical and Electronics", "Engineering Chemistry", "Statistics", "Python Lab"] },
    { semester: 3, subjects: ["Data Structures", "Discrete Mathematics", "Object Oriented Programming", "Database Management Systems", "Probability and Statistics", "DS Lab", "DBMS Lab"] },
    { semester: 4, subjects: ["Machine Learning", "Operating Systems", "Data Visualization", "Design and Analysis of Algorithms", "Data Mining", "ML Lab"] },
    { semester: 5, subjects: ["Artificial Intelligence", "Deep Learning", "Computer Networks", "Natural Language Processing", "Software Engineering", "AI Lab"] },
    { semester: 6, subjects: ["Big Data Analytics", "Cloud Computing", "Computer Vision", "Reinforcement Learning", "Data Analytics Lab", "Cloud Lab"] },
    { semester: 7, subjects: ["Internet of Things", "Generative AI", "MLOps", "Elective Subjects", "Project Work Phase 1"] },
    { semester: 8, subjects: ["Ethical AI", "Cyber Security", "Internship", "Major Project", "Electives"] }
  ],
  "ECE": [
    { semester: 1, subjects: ["Engineering Mathematics I", "Engineering Physics", "Engineering Graphics", "Basic Electrical Engineering", "English Communication", "Physics Lab"] },
    { semester: 2, subjects: ["Engineering Mathematics II", "Engineering Chemistry", "Programming in C", "Electronic Devices", "Environmental Science", "C Lab", "Chemistry Lab"] },
    { semester: 3, subjects: ["Analog Circuits", "Digital Electronics", "Signals and Systems", "Network Theory", "Electronic Measurements", "Analog Lab"] },
    { semester: 4, subjects: ["Microprocessors and Microcontrollers", "Communication Engineering", "Electromagnetic Theory", "Control Systems", "Linear Integrated Circuits", "Microprocessor Lab"] },
    { semester: 5, subjects: ["Digital Signal Processing", "VLSI Design", "Antenna and Wave Propagation", "Embedded Systems", "Computer Networks", "DSP Lab"] },
    { semester: 6, subjects: ["Wireless Communication", "Optical Communication", "Internet of Things", "Embedded C", "Microwave Engineering", "IoT Lab"] },
    { semester: 7, subjects: ["5G Communication", "Robotics", "AI for Electronics", "Elective Subjects", "Mini Project"] },
    { semester: 8, subjects: ["Satellite Communication", "Professional Ethics", "Internship", "Major Project", "Electives"] }
  ],
  "Information Technology": [
    { semester: 1, subjects: ["Engineering Mathematics I", "Engineering Physics", "Programming in C", "Engineering Graphics", "English Communication", "Physics Lab", "C Programming Lab"] },
    { semester: 2, subjects: ["Engineering Mathematics II", "Engineering Chemistry", "Basic Electrical and Electronics Engineering", "Python Programming", "Environmental Science", "Chemistry Lab", "Python Lab"] },
    { semester: 3, subjects: ["Data Structures", "Digital Principles and Computer Organization", "Object Oriented Programming", "Discrete Mathematics", "Database Management Systems", "Data Structures Lab", "OOP Lab"] },
    { semester: 4, subjects: ["Operating Systems", "Design and Analysis of Algorithms", "Software Engineering", "Computer Architecture", "Java Programming", "DBMS Lab", "Java Lab"] },
    { semester: 5, subjects: ["Computer Networks", "Web Technology", "Theory of Computation", "Mobile Computing", "Artificial Intelligence", "CN Lab", "Web Technology Lab"] },
    { semester: 6, subjects: ["Cloud Computing", "Machine Learning", "Cryptography and Network Security", "Data Analytics", "Internet Programming", "ML Lab", "Cloud Lab"] },
    { semester: 7, subjects: ["Internet of Things", "Big Data Analytics", "DevOps", "Full Stack Development", "Elective Subjects", "Project Work Phase 1"] },
    { semester: 8, subjects: ["Cyber Security", "Professional Ethics", "Internship", "Major Project", "Elective Subjects"] }
  ]
};

const generateCode = (name, dept, sem) => {
  const words = name.split(' ');
  const initials = words.map(w => w[0]).join('').toUpperCase();
  let deptCode = dept;
  if (dept === "Computer Science") deptCode = "CSE";
  if (dept === "Information Technology") deptCode = "IT";
  return `${deptCode}-${sem}-${initials}-${Math.floor(Math.random() * 900) + 100}`;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing subjects to avoid mess, though updateOne with upsert is safer
    console.log('Clearing old subjects...');
    await Subject.deleteMany({});

    for (const [dept, semesters] of Object.entries(curriculumData)) {
      for (const semData of semesters) {
        for (const subjectName of semData.subjects) {
          const subjectCode = generateCode(subjectName, dept, semData.semester);
          
          await Subject.create({
            subjectName,
            subjectCode,
            semester: semData.semester,
            department: dept,
            credits: subjectName.toLowerCase().includes('lab') ? 2 : 4
          });
        }
        console.log(`Seeded Sem ${semData.semester} for ${dept}`);
      }
    }

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
