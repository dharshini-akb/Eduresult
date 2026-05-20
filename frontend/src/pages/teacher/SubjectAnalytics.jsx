import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPieChart, FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const SubjectAnalytics = ({ portalType }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await axios.get('/api/teacher/subjects', config);
      setSubjects(Array.isArray(data) ? data : data.subjects || []);
    };
    fetchSubjects();
  }, []);

  const handleSubjectChange = async (e) => {
    const subId = e.target.value;
    setSelectedSubject(subId);
    if (!subId) return;

    const sub = subjects.find(s => s._id === subId);
    const { data } = await axios.get(`/api/teacher/analytics?subjectId=${subId}&semester=${sub.semester}`, config);
    setAnalytics(data);
  };

  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <FiActivity className="text-blue-600" />
          <span>Subject Analytics</span>
        </h3>
        <select 
          className="p-3 border rounded-xl bg-slate-50 font-medium outline-none max-w-xs"
          value={selectedSubject}
          onChange={handleSubjectChange}
        >
          <option value="">Select Subject</option>
          {[1,2,3,4,5,6,7,8].map(sem => {
            const semSubjects = subjects.filter(s => s.semester === sem);
            if (semSubjects.length === 0) return null;
            return (
              <optgroup key={sem} label={`Semester ${sem}`}>
                {semSubjects.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.subjectName} ({sub.subjectCode})</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-medium">Total Students</p>
              <h4 className="text-3xl font-bold text-gray-800">{analytics.total}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-green-600 text-sm mb-1 font-medium flex items-center">
                <FiTrendingUp className="mr-1" /> Passed
              </p>
              <h4 className="text-3xl font-bold text-gray-800">{analytics.passed}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-red-600 text-sm mb-1 font-medium flex items-center">
                <FiTrendingDown className="mr-1" /> Failed
              </p>
              <h4 className="text-3xl font-bold text-gray-800">{analytics.failed}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-gray-800 mb-8">Pass vs Fail Distribution</h4>
              <div className="w-full h-[256px] relative" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Passed', value: analytics.passed },
                        { name: 'Failed', value: analytics.failed }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-8 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-600">Passed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-sm font-medium text-gray-600">Failed</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
              <div className="p-6 bg-blue-50 rounded-full mb-6">
                <FiPieChart className="text-5xl text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Average Score</h4>
              <p className="text-6xl font-black text-blue-600">{analytics.avgMarks.toFixed(1)}</p>
              <p className="text-gray-400 mt-2 font-medium">Out of 100 total marks</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubjectAnalytics;
