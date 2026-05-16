import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FiUser, FiBook, FiAward, FiDownload, 
  FiActivity, FiCheckCircle 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const menuItems = [
  { path: '/student', label: 'My Results', icon: <FiAward /> },
  { path: '/student/profile', label: 'My Profile', icon: <FiUser /> },
  { path: '/student/performance', label: 'Performance', icon: <FiActivity /> },
];

const StudentDashboard = () => {
  const [results, setResults] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const [resultsRes, curriculumRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/student/results', config),
          axios.get('http://127.0.0.1:5000/api/student/curriculum', config)
        ]);

        setResults(resultsRes.data);
        setCurriculum(curriculumRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = results.map(r => ({
    name: r.subjectId?.subjectCode || 'N/A',
    marks: r.total || 0,
    gpa: r.GPA || 0
  }));

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Academic Performance</h3>
        <p className="text-gray-500 text-sm">Overview of your semester-wise results and grades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Marks Overview Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-gray-800 mb-6">Marks Overview</h4>
            <div className="w-full" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="marks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMarks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Curriculum Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-800">Current Semester Curriculum</h4>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Dynamically Loaded
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {curriculum.map((sub) => (
                <div key={sub._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    {sub.subjectCode.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{sub.subjectName}</p>
                    <p className="text-xs text-slate-400 font-mono">{sub.subjectCode}</p>
                  </div>
                </div>
              ))}
              {curriculum.length === 0 && !loading && (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                  No subjects found for your current semester in the curriculum.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl flex flex-col justify-center items-center h-fit sticky top-24">
          <div className="bg-white/20 p-4 rounded-full mb-4">
            <FiAward className="text-4xl" />
          </div>
          <h4 className="text-lg font-medium opacity-80 mb-2">Current CGPA</h4>
          <p className="text-5xl font-extrabold mb-4">9.24</p>
          <div className="flex items-center space-x-2 text-sm bg-white/10 px-4 py-2 rounded-full">
            <FiCheckCircle />
            <span>Top 5% of Class</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-gray-800">Subject-wise Results</h4>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition duration-200">
            <FiDownload />
            <span>Download Marksheet</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-sm uppercase">
                <th className="px-6 py-4 font-bold">Subject</th>
                <th className="px-6 py-4 font-bold text-center">Internal</th>
                <th className="px-6 py-4 font-bold text-center">External</th>
                <th className="px-6 py-4 font-bold text-center">Total</th>
                <th className="px-6 py-4 font-bold text-center">Grade</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 transition duration-150">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{r.subjectId?.subjectName || 'Unknown Subject'}</div>
                    <div className="text-xs text-gray-500">{r.subjectId?.subjectCode || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{r.internalMarks}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{r.externalMarks}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{r.total}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No results found or published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
