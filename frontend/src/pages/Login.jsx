import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiHash, FiAward } from 'react-icons/fi';

const Login = () => {
  const [loginType, setLoginType] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(
        identifier.trim(),
        loginType === 'student' ? '' : password,
        loginType
      );
      if (user.role === 'admin' || user.role === 'teacher' || user.role === 'head') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden dark:from-[#020617] dark:via-[#020617] dark:to-[#0f172a]">
      <motion.div className="absolute bottom-8 right-12 text-[160px] opacity-10 select-none pointer-events-none">🎓</motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-3">
            <FiAward className="text-2xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">EduResult</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Welcome Back!</p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-6">
          {['student', 'staff'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setLoginType(type);
                setIdentifier('');
                setPassword('');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition ${
                loginType === type ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              {type === 'student' ? 'Student' : 'Staff'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {loginType === 'student' ? 'Roll Number' : 'Email'}
            </label>
            <div className="relative">
              {loginType === 'student' ? (
                <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              ) : (
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <input
                type={loginType === 'student' ? 'text' : 'email'}
                placeholder={loginType === 'student' ? 'e.g. 23ITR001' : 'you@college.edu'}
                className="input-field pl-11"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          {loginType === 'staff' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 mt-2">
            {submitting ? 'Signing in...' : 'Continue'}
            {!submitting && <FiArrowRight className="inline ml-1" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="font-bold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
