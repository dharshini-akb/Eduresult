import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight, FiUserCheck } from 'react-icons/fi';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signup(name, email, password, role);
      if (user.role === 'admin' || user.role === 'teacher' || user.role === 'head') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden dark:from-[#020617] dark:via-[#020617] dark:to-[#0f172a]">
      <motion.div className="absolute bottom-8 right-12 text-[160px] opacity-10 select-none pointer-events-none">✨</motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Join our educational platform today</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Full Name"
              className="input-field pl-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="input-field pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="input-field pl-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiUserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="input-field pl-11 appearance-none cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="head">Head (System Manager)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 mt-2"
          >
            <span>Sign Up</span>
            <FiArrowRight />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
