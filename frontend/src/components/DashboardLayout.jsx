import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiUsers, FiBook, FiSettings, FiLogOut, 
  FiPieChart, FiFileText, FiUser, FiBell, FiRefreshCw
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children, menuItems, portalType, onSwitchPortal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
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
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
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
            <button className="p-2 text-gray-500 hover:bg-slate-100 rounded-full">
              <FiBell className="text-xl" />
            </button>
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
