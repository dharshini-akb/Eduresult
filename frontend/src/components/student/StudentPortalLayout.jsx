import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getProfileImageUrl } from '../../utils/gpa';
import {
  FiGrid, FiAward, FiDownload, FiBell,
  FiUser, FiLogOut, FiMenu, FiSearch, FiBookOpen, FiSun, FiMoon
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'results', label: 'My Results', icon: FiAward },
  { id: 'download', label: 'Download Center', icon: FiDownload },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'profile', label: 'Profile', icon: FiUser },
];

const StudentPortalLayout = ({ activeTab, onTabChange, profile, children, pageTitle }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo?.token) return;
      const { data } = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayName = profile?.userId?.name || user?.name || 'Student';
  const rollNo = profile?.registerNumber || user?.registerNumber || '—';
  const dept = profile?.department || user?.department || '—';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <motion.div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <motion.div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
          <FiAward className="text-xl" />
        </motion.div>
        <span className="text-2xl font-black tracking-tight text-white">EduResult</span>
      </motion.div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onTabChange(id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="text-xl" />
              {label}
            </button>
          );
        })}
      </nav>
      <motion.div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <FiLogOut className="text-xl" /> Logout
        </button>
      </motion.div>
    </div>
  );

  return (
    <motion.div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 gap-4 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 sticky top-0 z-40">
          <motion.div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <FiMenu className="text-xl" />
            </button>
            <h1 className="text-xl font-black text-slate-800 dark:text-white truncate hidden sm:block capitalize">{pageTitle}</h1>
          </motion.div>

          <motion.div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            <motion.div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 relative text-slate-600 dark:text-slate-400 transition-colors"
              >
                <FiBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 max-h-96 overflow-y-auto"
                  >
                    <motion.div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-white">Notifications</motion.div>
                    {notifications.length ? (
                      notifications.slice(0, 5).map((n) => (
                        <motion.div key={n._id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <p className="font-bold text-slate-800 dark:text-white">{n.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="p-8 text-center text-slate-400 text-sm italic">No new notifications</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        onTabChange('notifications');
                      }}
                      className="w-full p-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      View all activity
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800">
              <motion.div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{displayName}</p>
                <div className="flex flex-col text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <span>{rollNo}</span>
                  <span>{dept}</span>
                </div>
              </motion.div>
              <img
                src={getProfileImageUrl(profile?.userId?.profileImage || user?.profileImage, displayName)}
                alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-900/50"
              />
            </motion.div>
          </motion.div>
        </header>

        <motion.div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">{children}</motion.div>
      </main>
    </motion.div>
  );
};

export default StudentPortalLayout;
