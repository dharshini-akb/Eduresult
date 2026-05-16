import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FiUser, FiBook, FiAward, FiDownload, 
  FiActivity, FiCheckCircle, FiMail, FiMapPin, FiPhone, FiCalendar, FiBriefcase, FiPrinter
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('results'); // 'results', 'profile', 'performance'
  const [results, setResults] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('All');

  const menuItems = [
    { id: 'results', label: 'My Results', icon: <FiAward />, onClick: () => setActiveTab('results') },
    { id: 'performance', label: 'Performance', icon: <FiActivity />, onClick: () => setActiveTab('performance') },
    { id: 'profile', label: 'My Profile', icon: <FiUser />, onClick: () => setActiveTab('profile') },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const [resultsRes, curriculumRes, profileRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/student/results', config),
          axios.get('http://127.0.0.1:5000/api/student/curriculum', config),
          axios.get('http://127.0.0.1:5000/api/student/profile', config)
        ]);

        setResults(resultsRes.data);
        setCurriculum(curriculumRes.data);
        setProfile(profileRes.data);
        if (profileRes.data?.semester) {
          setSelectedSemester(profileRes.data.semester.toString());
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach(r => {
      const sem = r.semester || 'Other';
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(r);
    });
    return groups;
  }, [results]);

  const semesters = useMemo(() => {
    return ['All', ...Object.keys(groupedResults).sort((a, b) => a - b)];
  }, [groupedResults]);

  const filteredGroupedResults = useMemo(() => {
    if (selectedSemester === 'All') return groupedResults;
    return { [selectedSemester]: groupedResults[selectedSemester] || [] };
  }, [groupedResults, selectedSemester]);

  const groupedCurriculum = useMemo(() => {
    const groups = {};
    curriculum.forEach(sub => {
      if (!groups[sub.semester]) groups[sub.semester] = [];
      groups[sub.semester].push(sub);
    });
    return groups;
  }, [curriculum]);

  const isSemesterComplete = (sem) => {
    const resultsCount = groupedResults[sem]?.length || 0;
    const subjectsCount = groupedCurriculum[sem]?.length || 0;
    return subjectsCount > 0 && resultsCount === subjectsCount;
  };

  const downloadMarksheet = (sem) => {
    if (!isSemesterComplete(sem)) {
      alert('Cannot download marksheet: Not all subjects have published results for this semester.');
      return;
    }
    const doc = new jsPDF();
    const semResults = groupedResults[sem];
    
    // Add Header
    doc.setFontSize(20);
    doc.text('EduResult Academic Marksheet', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Name: ${profile?.userId?.name}`, 20, 40);
    doc.text(`Reg No: ${profile?.registerNumber}`, 20, 50);
    doc.text(`Department: ${profile?.department}`, 20, 60);
    doc.text(`Semester: ${sem}`, 20, 70);

    const tableData = semResults.map(r => [
      r.subjectId?.subjectName || 'N/A',
      r.subjectId?.subjectCode || 'N/A',
      r.subjectId?.credits || 0,
      r.internalMarks,
      r.externalMarks,
      r.total,
      r.grade,
      r.status
    ]);

    doc.autoTable({
      startY: 80,
      head: [['Subject', 'Code', 'Credits', 'Internal', 'External', 'Total', 'Grade', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    
    // CGPA Calculation Logic based on user request: Sum(GradePoint * Credits) / Sum(Credits)
    let semTotalCredits = 0;
    let semTotalPoints = 0;
    semResults.forEach(r => {
      const credits = r.subjectId?.credits || 0;
      const points = r.GPA || 0;
      semTotalCredits += credits;
      semTotalPoints += points * credits;
    });
    
    const semGPA = semTotalCredits > 0 ? (semTotalPoints / semTotalCredits).toFixed(2) : '0.00';
    
    doc.text(`Semester GPA: ${semGPA}`, 20, finalY);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, finalY + 10);

    doc.save(`Marksheet_Sem${sem}_${profile?.registerNumber}.pdf`);
  };

  const chartData = results.map(r => ({
    name: r.subjectId?.subjectCode || 'N/A',
    marks: r.total || 0,
    gpa: r.GPA || 0
  }));

  const cgpa = useMemo(() => {
    if (results.length === 0) return '0.00';
    let totalCredits = 0;
    let totalPoints = 0;
    results.forEach(r => {
      const credits = r.subjectId?.credits || 0;
      const points = r.GPA || 0;
      totalCredits += credits;
      totalPoints += points * credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [results]);

  const renderResults = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Semester Filter */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {semesters.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              selectedSemester === sem
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
          </button>
        ))}
      </div>

      {Object.keys(filteredGroupedResults).sort((a, b) => a - b).map(sem => (
        <div key={sem} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h4 className="text-xl font-black text-slate-800">Semester {sem} Results</h4>
              <p className="text-sm text-slate-500 font-medium">{profile?.department}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={() => downloadMarksheet(sem)}
                disabled={!isSemesterComplete(sem)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg ${
                  isSemesterComplete(sem) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <FiDownload />
                <span>Download Sem {sem} Marksheet</span>
              </button>
              {!isSemesterComplete(sem) && (
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  Awaiting {groupedCurriculum[sem]?.length - (groupedResults[sem]?.length || 0)} subject(s)
                </p>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Subject Details</th>
                <th className="px-8 py-6 text-center">Credits</th>
                <th className="px-8 py-6 text-center">Internal (40)</th>
                <th className="px-8 py-6 text-center">External (60)</th>
                <th className="px-8 py-6 text-center">Total (100)</th>
                <th className="px-8 py-6 text-center">Grade</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGroupedResults[sem].map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 transition duration-150 group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{r.subjectId?.subjectName || 'Unknown Subject'}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{r.subjectId?.subjectCode || 'N/A'}</div>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-slate-600">{r.subjectId?.credits || 0}</td>
                  <td className="px-8 py-6 text-center font-bold text-slate-600">{r.internalMarks}</td>
                    <td className="px-8 py-6 text-center font-bold text-slate-600">{r.externalMarks}</td>
                    <td className="px-8 py-6 text-center font-black text-blue-600 text-lg">{r.total}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black">
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        r.status === 'Pass' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {results.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <FiAward className="text-3xl text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold">No results have been published yet.</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-xl font-black text-slate-800">Enrolled Subjects</h4>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Current Semester</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curriculum.filter(sub => sub.semester === profile?.semester).map((sub) => (
            <div key={sub._id} className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-blue-600 transition-colors duration-500">
                <FiBook className="text-blue-600 group-hover:text-white" />
              </div>
              <h5 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{sub.subjectName}</h5>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{sub.subjectCode}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderPerformance = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl font-black text-slate-800">Marks Progression</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-400">Total Marks</span>
              </div>
            </div>
          </div>
          <div className="w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#perfGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-xl border border-white/10">
            <FiAward className="text-4xl text-blue-400" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Overall CGPA</h4>
          <p className="text-7xl font-black mb-6 tracking-tighter">{cgpa}</p>
          <div className="flex items-center space-x-2 text-xs font-bold bg-green-500/20 text-green-400 px-6 py-3 rounded-2xl border border-green-500/20">
            <FiCheckCircle />
            <span>EXCELLENT STANDING</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceCard label="Highest Mark" value={Math.max(...results.map(r => r.total || 0), 0)} icon={<FiAward />} color="blue" />
        <PerformanceCard label="Average Mark" value={results.length ? (results.reduce((a, b) => a + (b.total || 0), 0) / results.length).toFixed(0) : 0} icon={<FiActivity />} color="indigo" />
        <PerformanceCard label="Subjects Passed" value={results.filter(r => r.status === 'Pass').length} icon={<FiCheckCircle />} color="green" />
        <PerformanceCard label="Attendance" value={`${profile?.attendance || 0}%`} icon={<FiClock />} color="orange" />
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
          <div className="relative inline-block mb-8">
            <img 
              src={profile?.userId?.profileImage || `https://ui-avatars.com/api/?name=${profile?.userId?.name}&background=3b82f6&color=fff&size=128`}
              alt="Profile" 
              className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white shadow-xl mx-auto"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-2xl flex items-center justify-center">
              <FiCheckCircle className="text-white text-xs" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">{profile?.userId?.name}</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{profile?.registerNumber}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">Student</span>
            <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">Active</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-8">Contact Info</h4>
          <div className="space-y-6">
            <ContactItem icon={<FiMail />} label="Email Address" value={profile?.userId?.email} />
            <ContactItem icon={<FiPhone />} label="Phone Number" value="+91 98765 43210" />
            <ContactItem icon={<FiMapPin />} label="Location" value="Tamil Nadu, India" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-10">Academic Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <AcademicDetail icon={<FiBriefcase />} label="Department" value={profile?.department} color="blue" />
            <AcademicDetail icon={<FiCalendar />} label="Current Semester" value={`Semester ${profile?.semester}`} color="indigo" />
            <AcademicDetail icon={<FiUser />} label="Section" value={`Section ${profile?.section || 'A'}`} color="purple" />
            <AcademicDetail icon={<FiAward />} label="Batch" value="2023 - 2027" color="pink" />
          </div>
        </div>

        <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-2xl font-black mb-4">Need academic support?</h4>
            <p className="text-blue-100 font-medium mb-8 max-w-md">Contact your department head or counselor for any queries regarding your results or curriculum.</p>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 transition shadow-lg">
              Contact Counselor
            </button>
          </div>
          <FiBook className="absolute -bottom-10 -right-10 text-[15rem] text-white/10 rotate-12" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout 
      menuItems={menuItems.map(item => ({
        ...item,
        className: activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
      }))}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">
            {activeTab === 'results' ? 'Academic Results' : activeTab === 'performance' ? 'Performance Analytics' : 'My Student Profile'}
          </h3>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back, <span className="text-blue-600 font-bold">{profile?.userId?.name}</span>
          </p>
        </div>
        
        {activeTab !== 'profile' && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${results.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest pr-2">
              {results.length > 0 ? 'Results Published' : 'Results Pending'}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'results' && renderResults()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'profile' && renderProfile()}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const PerformanceCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  );
};

const ContactItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const AcademicDetail = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600"
  };

  return (
    <div className="flex items-center gap-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
