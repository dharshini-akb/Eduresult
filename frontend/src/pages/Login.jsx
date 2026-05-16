import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiUser, FiHash } from 'react-icons/fi';

const Login = () => {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'staff'
  const [identifier, setIdentifier] = useState(''); // Email or Roll No
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // For students, we send roll number as 'email' and no password
      const user = await login(identifier, loginType === 'student' ? '' : password);
      if (user.role === 'admin' || user.role === 'teacher' || user.role === 'head') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Portal Login</h2>
          <p className="text-slate-500 font-medium">Access your academic records</p>
        </div>

        {/* Login Type Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button
            onClick={() => { setLoginType('student'); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              loginType === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => { setLoginType('staff'); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              loginType === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Staff / Head
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
            {error === 'Invalid Roll Number' ? 'Invalid username' : error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            {loginType === 'student' ? (
              <FiHash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            ) : (
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            )}
            <input
              type={loginType === 'student' ? 'text' : 'email'}
              placeholder={loginType === 'student' ? 'Roll Number (e.g. 23ITR001)' : 'Email Address'}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {loginType === 'staff' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative"
            >
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition duration-300 shadow-xl shadow-blue-200"
          >
            <span>Login to Dashboard</span>
            <FiArrowRight />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Access Demo</p>
          <div className="flex flex-col gap-2">
            <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 flex justify-between items-center">
              <span className="font-bold text-blue-600 uppercase">Student</span>
              <span>Roll: S2026001</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 flex justify-between items-center">
              <span className="font-bold text-indigo-600 uppercase">Head</span>
              <span>head@test.com / password123</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
