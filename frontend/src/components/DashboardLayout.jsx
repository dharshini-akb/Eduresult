import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiUsers, FiBook, FiSettings, FiLogOut, 
  FiPieChart, FiFileText, FiUser, FiBell, FiRefreshCw, FiClock, FiCheck
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children, menuItems, portalType, onSwitchPortal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

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
      const { data } = await axios.get('http://127.0.0.1:5000/api/notifications', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`http://127.0.0.1:5000/api/notifications/${id}`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put('http://127.0.0.1:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center space-x-2">
          <FiBook className="text-3xl text-blue-600" />
          <span className="text-xl font-bold text-gray-800">EduResult</span>
        </div>
        
        {portalType && (
          <div className="px-6 mb-4">
            <div className={`px-4 py-2 rounded-lg text-sm font-bold capitalize flex items-center justify-between ${
              portalType === 'head' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}>
              <span>{portalType} Portal</span>
              {onSwitchPortal && (
                <button 
                  onClick={onSwitchPortal}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                  title="Switch Portal"
                >
                  <FiRefreshCw className="text-xs" />
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = item.path ? location.pathname === item.path : item.className?.includes('bg-blue-600');
            const commonClasses = `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`;

            if (item.onClick) {
              return (
                <button
                  key={item.id || item.label}
                  onClick={item.onClick}
                  className={commonClasses}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={commonClasses}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          {onSwitchPortal && (
            <button
              onClick={onSwitchPortal}
              className="w-full flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition duration-200"
            >
              <FiRefreshCw />
              <span className="font-medium">Switch Portal</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition duration-200"
          >
            <FiLogOut />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(i => (i.path && location.pathname === i.path) || (i.className?.includes('bg-blue-600')))?.label || 'Dashboard'}
            </h2>
            {portalType && (
              <span className={`md:hidden px-3 py-1 rounded-full text-xs font-bold capitalize ${
                portalType === 'head' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {portalType}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-slate-100 rounded-full relative transition-colors"
              >
                <FiBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllRead}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n._id}
                            onClick={() => !n.isRead && markAsRead(n._id)}
                            className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-bold ${!n.isRead ? 'text-blue-700' : 'text-slate-700'}`}>
                                {n.title}
                              </h4>
                              {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">
                              {n.message}
                            </p>
                            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <FiClock className="mr-1" />
                              {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <FiBell className="text-3xl text-slate-200 mx-auto mb-3" />
                          <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800 leading-none">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <img
                src={user?.profileImage || 'https://ui-avatars.com/api/?name=' + user?.name}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-100"
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
