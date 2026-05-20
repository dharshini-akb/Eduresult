import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FiUsers, FiBook, FiPieChart, FiPlus, 
  FiSearch, FiFilter, FiTrendingUp, FiBell, FiAward, FiUser
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Sub-components
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import SubjectManagement from './SubjectManagement';
import ToppersList from './ToppersList';
import Announcements from './Announcements';
import Profile from '../Profile';

const menuItems = [
  { path: '/admin', label: 'Overview', icon: <FiPieChart /> },
  { path: '/admin/teachers', label: 'Teachers', icon: <FiUsers /> },
  { path: '/admin/students', label: 'Students', icon: <FiUsers /> },
  { path: '/admin/subjects', label: 'Subjects', icon: <FiBook /> },
  { path: '/admin/toppers', label: 'Toppers', icon: <FiAward /> },
  { path: '/admin/announcements', label: 'Announcements', icon: <FiBell /> },
  { path: '/admin/profile', label: 'Profile', icon: <FiUser /> },
];

const Overview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    passPercentage: 0,
    failedStudents: 0,
    pendingExternal: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const { data } = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Pass', value: parseFloat(stats.passPercentage) || 0 },
    { name: 'Fail', value: 100 - (parseFloat(stats.passPercentage) || 0) },
  ];

  const COLORS = ['#3b82f6', '#f43f5e'];

  return (
    <>
      {stats.pendingExternal > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
              <FiBell className="text-xl" />
            </div>
            <div>
              <p className="text-amber-900 dark:text-amber-100 font-bold">Action Required: Pending Marks</p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">Teachers have entered internal marks for {stats.pendingExternal} students. Please update their external marks.</p>
            </div>
          </div>
          <Link 
            to="/teacher" 
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-200 text-center"
          >
            Go to Head Portal
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.totalStudents} icon={<FiUsers />} color="bg-blue-500" />
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={<FiUsers />} color="bg-purple-500" />
        <StatCard title="Pass Percentage" value={`${stats.passPercentage}%`} icon={<FiTrendingUp />} color="bg-green-500" />
        <StatCard title="Failed Students" value={stats.failedStudents} icon={<FiFilter />} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Performance Overview</h3>
          <div className="w-full h-[250px] relative" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                <YAxis tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Quick Navigation</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <QuickLink to="/admin/teachers" icon={<FiPlus />} label="Manage Teachers" color="blue" />
            <QuickLink to="/admin/students" icon={<FiPlus />} label="Manage Students" color="purple" />
            <QuickLink to="/admin/subjects" icon={<FiPlus />} label="Manage Subjects" color="green" />
            <QuickLink to="/admin/announcements" icon={<FiBell />} label="Post News" color="yellow" />
          </div>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <DashboardLayout 
      menuItems={menuItems}
      portalType={user.role === 'head' ? 'admin' : null}
      onSwitchPortal={user.role === 'head' ? () => navigate('/teacher') : null}
    >
      <Routes>
        <Route index element={<Overview isDarkMode={isDarkMode} />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="teachers" element={<TeacherManagement />} />
        <Route path="subjects" element={<SubjectManagement />} />
        <Route path="toppers" element={<ToppersList />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${color} text-white text-2xl shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const QuickLink = ({ to, icon, label, color }) => (
  <Link to={to} className={`flex items-center space-x-3 p-4 rounded-xl border-2 border-transparent hover:border-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-900/10 transition duration-300 group`}>
    <span className={`text-${color}-600 dark:text-${color}-400 text-xl transform group-hover:scale-110 transition duration-300`}>{icon}</span>
    <span className="font-semibold text-gray-700 dark:text-slate-200">{label}</span>
  </Link>
);

export default AdminDashboard;
