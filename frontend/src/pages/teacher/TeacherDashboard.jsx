import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiUsers, FiUpload, FiTrendingUp, FiBriefcase, FiUser, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Sub-components
import MarkEntry from './MarkEntry';
import SubjectAnalytics from './SubjectAnalytics';
import Profile from '../Profile';

import { useTheme } from '../../context/ThemeContext';

const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [selectedPortal, setSelectedPortal] = useState(user.role === 'teacher' ? 'teacher' : null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const menuItems = [
    { path: '/teacher', label: 'Analytics', icon: <FiTrendingUp /> },
    { path: '/teacher/marks', label: 'Mark Entry', icon: <FiEdit3 /> },
    { path: '/teacher/profile', label: 'Profile', icon: <FiUser /> },
  ];

  if (user.role === 'head' && !selectedPortal) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="max-w-5xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Welcome, {user.name}</h1>
            <p className={`text-lg ${isDarkMode ? 'text-blue-900/80 font-bold' : 'text-gray-600'}`}>Select a portal to manage the system</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Portal Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin')}
              className={`p-8 rounded-3xl shadow-xl cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all duration-300 group ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <FiSettings className="text-3xl text-purple-600 dark:text-purple-400 group-hover:text-white" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Admin Portal</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Maintain the whole system: manage teachers, students, subjects, and global announcements.</p>
            </motion.div>

            {/* Head Portal Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPortal('head')}
              className={`p-8 rounded-3xl shadow-xl cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 group ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <FiBriefcase className="text-3xl text-blue-600 dark:text-blue-400 group-hover:text-white" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Head Portal</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Enter external marks, view department analytics, and manage final results.</p>
            </motion.div>

            {/* Teacher Portal Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPortal('teacher')}
              className={`p-8 rounded-3xl shadow-xl cursor-pointer border-2 border-transparent hover:border-green-500 transition-all duration-300 group ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors duration-300">
                <FiUser className="text-3xl text-green-600 dark:text-green-400 group-hover:text-white" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Teacher Portal</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Manage your subjects, enter internal assessment marks, and track student progress.</p>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => navigate('/login')}
              className={`font-medium transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      menuItems={menuItems} 
      portalType={selectedPortal}
      onSwitchPortal={user.role === 'head' ? () => setSelectedPortal(null) : null}
    >
      <Routes>
        <Route index element={<SubjectAnalytics portalType={selectedPortal} />} />
        <Route path="marks" element={<MarkEntry />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
