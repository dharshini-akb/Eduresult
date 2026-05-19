import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  FiAward, FiDownload, FiUsers, FiBarChart2, FiArrowRight, FiCheckCircle, 
  FiShield, FiZap, FiTarget, FiSun, FiMoon, FiMail, FiMessageSquare, FiX
} from 'react-icons/fi';

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showContact, setShowNotifications] = useState(false); // Using for contact modal

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-blue-500' : 'bg-slate-50 text-slate-900'} selection:bg-blue-600/30`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-colors ${isDarkMode ? 'bg-black/90 border-blue-900/50' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <FiAward className="text-xl" />
            </motion.div>
            <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-blue-500' : 'text-slate-900'}`}>EduResult</span>
          </motion.div>
          
          <div className={`hidden md:flex items-center gap-8 text-sm font-bold ${isDarkMode ? 'text-blue-800' : 'text-slate-500'}`}>
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#" className="hover:text-blue-400 transition">About</a>
            <button onClick={() => setShowNotifications(true)} className="hover:text-blue-400 transition">Help</button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-900 text-blue-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>
            <Link to="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition shadow-lg shadow-blue-600/20 flex items-center gap-2">
              Sign in <FiArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none`} />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'bg-blue-600/10 border-blue-600/20 text-blue-500' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              Result Management Only
            </span>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.2] mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Simple. Secure. <br />
              Streamlined. <br />
              <span className="text-blue-600">Results that matter.</span>
            </h1>
            <p className={`text-lg mb-10 leading-relaxed max-w-lg ${isDarkMode ? 'text-blue-900/80 font-bold' : 'text-slate-600'}`}>
              Publish marks, track CGPA, and download marksheets — all in one focused portal for colleges.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link to="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition shadow-xl shadow-blue-600/25 flex items-center gap-3 group">
                Open portal <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className={`px-8 py-4 rounded-2xl font-black text-lg transition border ${isDarkMode ? 'bg-black hover:bg-blue-950 text-blue-500 border-blue-600/50' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}>
                Learn more
              </button>
            </div>

            <div className={`grid grid-cols-3 gap-8 mt-16 pt-16 border-t ${isDarkMode ? 'border-blue-900/30' : 'border-slate-200'}`}>
              <Stat icon={<FiShield />} label="Secure" desc="College data stays protected" isDarkMode={isDarkMode} />
              <Stat icon={<FiTarget />} label="Accurate" desc="Real-time results and CGPA" isDarkMode={isDarkMode} />
              <Stat icon={<FiZap />} label="Instant" desc="Quick marksheet downloads" isDarkMode={isDarkMode} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full opacity-50" />
            <div className={`relative rounded-[2.5rem] border p-2 shadow-2xl ${isDarkMode ? 'bg-blue-950/20 border-blue-600/30' : 'bg-white border-slate-200'}`}>
              <div className={`rounded-[2rem] overflow-hidden aspect-[16/10] border ${isDarkMode ? 'bg-black border-blue-600/20' : 'bg-slate-50 border-slate-100'}`}>
                <div className="p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className={`font-black uppercase tracking-tighter text-sm ${isDarkMode ? 'text-blue-500' : 'text-slate-400'}`}>Results Overview</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-900/50" />
                      <div className="w-3 h-3 rounded-full bg-blue-800/50" />
                      <div className="w-3 h-3 rounded-full bg-blue-700/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black border-blue-600/30' : 'bg-white border-slate-200'}`}>
                      <p className={`text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>Published</p>
                      <p className={`text-2xl font-black ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>32</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black border-blue-600/30' : 'bg-white border-slate-200'}`}>
                      <p className={`text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>Students</p>
                      <p className={`text-2xl font-black flex items-center gap-2 ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>
                        <FiUsers className="text-blue-600 text-sm" /> 4,256
                      </p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black border-blue-600/30' : 'bg-white border-slate-200'}`}>
                      <p className={`text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>Avg CGPA</p>
                      <p className="text-2xl font-black text-blue-600">8.72</p>
                    </div>
                  </div>
                  <div className={`flex-1 rounded-2xl border p-4 relative overflow-hidden ${isDarkMode ? 'bg-black border-blue-600/30' : 'bg-white border-slate-200'}`}>
                    <p className={`text-[10px] font-black uppercase mb-4 ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>CGPA Trend</p>
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-600/10 to-transparent" />
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <path d="M0 80 Q 50 70, 100 75 T 200 40 T 300 50 T 400 20" fill="none" stroke="#2563eb" strokeWidth="4" />
                      <circle cx="400" cy="20" r="5" fill="#2563eb" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Preview Overlay */}
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`absolute -right-8 -bottom-8 w-48 rounded-[2rem] border p-2 shadow-2xl hidden md:block backdrop-blur-md ${isDarkMode ? 'bg-blue-950/40 border-blue-600/30' : 'bg-white/80 border-slate-200'}`}
            >
              <div className={`rounded-[1.8rem] p-4 aspect-[9/19] border ${isDarkMode ? 'bg-black border-blue-600/20' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-8 h-1 rounded-full mx-auto mb-6 ${isDarkMode ? 'bg-blue-900/30' : 'bg-slate-200'}`} />
                <p className={`text-[10px] font-black uppercase mb-4 ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>Marksheet</p>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900/20' : 'bg-slate-200'}`} />
                  <div className="space-y-2">
                    <div className={`w-16 h-2 rounded-full ${isDarkMode ? 'bg-blue-900/20' : 'bg-slate-200'}`} />
                    <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-blue-900/10' : 'bg-slate-100'}`} />
                  </div>
                </div>
                <div className="mt-auto space-y-4">
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-black border-blue-600/30' : 'bg-white border-slate-200'}`}>
                    <p className={`text-[8px] font-black uppercase ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>CGPA</p>
                    <p className="text-lg font-black text-blue-600">8.72</p>
                    <span className="text-[8px] font-black text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full mt-1 inline-block">Excellent</span>
                  </div>
                  <div className="w-full py-2 bg-blue-600 rounded-lg text-[10px] font-black text-white text-center flex items-center justify-center gap-2">
                    <FiDownload className="text-xs" /> Download
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 px-6 relative border-t ${isDarkMode ? 'border-blue-900/50' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>Built for results</h2>
            <p className={`font-bold ${isDarkMode ? 'text-blue-900' : 'text-slate-500'}`}>Everything you need to manage academic records efficiently.</p>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Feature icon={<FiBarChart2 />} title="CGPA engine" text="Credit-weighted GPA using standard grade points." isDarkMode={isDarkMode} />
            <Feature icon={<FiDownload />} title="Marksheet PDF" text="Instant generation with custom templates." isDarkMode={isDarkMode} />
            <Feature icon={<FiUsers />} title="Role portals" text="Secure separate flows for students and faculty." isDarkMode={isDarkMode} />
            <Feature icon={<FiCheckCircle />} title="Publish control" text="Granular control over result publication." isDarkMode={isDarkMode} />
          </motion.div>
        </div>
      </section>

      <footer className={`py-12 px-6 text-center border-t ${isDarkMode ? 'border-blue-900/30' : 'border-slate-200'}`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
            <FiAward />
          </div>
          <span className={`font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-500' : 'text-slate-900'}`}>EduResult</span>
        </div>
        <p className={`font-bold text-sm tracking-wide ${isDarkMode ? 'text-blue-900' : 'text-slate-400'}`}>© 2026 Academic result management system</p>
      </footer>

      {/* Contact Us Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl shadow-2xl border p-8 sm:p-10 ${isDarkMode ? 'bg-slate-900 border-blue-900/50' : 'bg-white border-slate-200'}`}
            >
              <button 
                onClick={() => setShowNotifications(false)}
                className={`absolute top-6 right-6 p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <FiX className="text-xl" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <FiMessageSquare className="text-xl" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Contact Us</h2>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-slate-500'}`}>We're here to help you</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowNotifications(false); alert('Message sent!'); }}>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-blue-900' : 'text-slate-500'}`}>Full Name</label>
                  <input type="text" placeholder="Your name" className="input-field" required />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-blue-900' : 'text-slate-500'}`}>Email Address</label>
                  <input type="email" placeholder="you@college.edu" className="input-field" required />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-blue-900' : 'text-slate-500'}`}>Message</label>
                  <textarea rows="4" placeholder="How can we help?" className="input-field resize-none py-4" required></textarea>
                </div>
                <button type="submit" className="btn-primary w-full py-4 mt-4 text-lg">
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Feature = ({ icon, title, text, isDarkMode }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
    whileHover={{ y: -8 }}
    className={`p-8 rounded-[2rem] border transition-all duration-300 group ${isDarkMode ? 'bg-black border-blue-900/20 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}
  >
    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className={`font-black mb-3 text-lg ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-blue-400/60' : 'text-slate-500'}`}>{text}</p>
  </motion.div>
);

const Stat = ({ icon, label, desc, isDarkMode }) => (
  <div className="flex items-start gap-4">
    <div className="text-blue-600 text-xl mt-1">{icon}</div>
    <div>
      <p className={`font-black text-sm ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>{label}</p>
      <p className={`font-bold text-xs mt-1 leading-tight ${isDarkMode ? 'text-blue-900' : 'text-slate-500'}`}>{desc}</p>
    </div>
  </div>
);

export default LandingPage;
