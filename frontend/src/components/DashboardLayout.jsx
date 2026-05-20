import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProfileImageUrl } from '../utils/gpa';
import {
  FiBook, FiLogOut, FiBell, FiRefreshCw, FiClock, FiSun, FiMoon, FiAward
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children, menuItems, portalType, onSwitchPortal }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'student') return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const { data } = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`/api/notifications/${id}`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isStudent = user?.role === 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLabel =
    menuItems.find(
      (i) => (i.path && location.pathname === i.path) || i.className?.includes('bg-blue-600')
    )?.label || 'Dashboard';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <FiAward className="text-xl" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight">EduResult</span>
            {portalType && (
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider capitalize">{portalType}</p>
            )}
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded-lg hover:bg-white/10">
          <FiX className="text-xl" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.path
            ? location.pathname === item.path
            : item.className?.includes('bg-blue-600');
          const classes = `w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`;

          if (item.onClick) {
            return (
              <button key={item.id || item.label} onClick={() => { item.onClick(); setSidebarOpen(false); }} className={classes}>
                {item.icon}
                {item.label}
              </button>
            );
          }
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={classes}>
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        {onSwitchPortal && (
          <button
            onClick={() => { onSwitchPortal(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FiRefreshCw /> Switch portal
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <FiLogOut className="text-xl" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      <aside className="w-72 bg-slate-900 text-white hidden md:flex flex-col shrink-0 border-r border-slate-800">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-[70] flex flex-col shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 sticky top-0 z-40 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <FiMenu className="text-xl" />
            </button>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white capitalize truncate max-w-[150px] sm:max-w-none">{activeLabel}</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            {!isStudent && (
              <div className="relative" ref={notificationRef}>
                <button
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
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900"
                      >
                        <span className="font-bold text-slate-800 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            Mark all read
                          </button>
                        )}
                      </motion.div>
                      <div className="max-h-80 overflow-y-auto bg-white dark:bg-slate-900">
                        {notifications.length ? (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => !n.isRead && markAsRead(n._id)}
                              className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{n.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                                <FiClock /> {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="p-8 text-center text-sm text-slate-400 italic">No new notifications</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider capitalize">{user?.role}</p>
              </div>
              <img
                src={getProfileImageUrl(user?.profileImage, user?.name)}
                alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-900/50"
              />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
