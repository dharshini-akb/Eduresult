import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiBookOpen, FiUsers, FiAward, FiBarChart2, 
  FiArrowRight, FiCheckCircle, FiShield, FiSmartphone 
} from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-600">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-[2rem] px-8 py-4 flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FiBookOpen className="text-xl text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">EduResult</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-sm font-black text-slate-500 hover:text-blue-600 transition-colors tracking-widest uppercase">Features</a>
              <a href="#about" className="text-sm font-black text-slate-500 hover:text-blue-600 transition-colors tracking-widest uppercase">About</a>
              <Link to="/login" className="px-8 py-3 bg-slate-950 text-white rounded-xl text-sm font-black hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-10 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center space-x-3 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm"
              >
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Academic Session 2026 is Live</span>
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter"
                >
                  Streamline <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">Academic</span> <br />
                  Results.
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                >
                  The most advanced Result Management System for modern institutions. 
                  Automate grading, track performance, and deliver excellence with one unified platform.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
              >
                <Link to="/login" className="group relative px-10 py-5 bg-slate-950 text-white rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center gap-3">
                    Get Started Now
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <button className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all hover:shadow-lg">
                  Watch Demo
                </button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-8 flex flex-wrap justify-center lg:justify-start gap-8 opacity-40 grayscale contrast-125"
              >
                <div className="flex items-center gap-2 font-black text-lg italic text-slate-900">
                  <FiAward className="text-xl" /> UNIVERSITY
                </div>
                <div className="flex items-center gap-2 font-black text-lg italic text-slate-900">
                  <FiShield className="text-xl" /> SECURE
                </div>
                <div className="flex items-center gap-2 font-black text-lg italic text-slate-900">
                  <FiBarChart2 className="text-xl" /> ANALYTICS
                </div>
              </motion.div>
            </div>

            <div className="lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, x: 40, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                className="relative z-10"
              >
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
                
                {/* Main "App" Window */}
                <div className="relative bg-white p-2 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100">
                    <div className="h-10 bg-white border-b border-slate-100 flex items-center px-6 gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                      alt="Platform Interface" 
                      className="w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>

                {/* Floating Performance Card */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-10 top-1/4 z-20 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden xl:block w-64"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Performance</p>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full">+12.5%</span>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      <div className="flex-1 bg-blue-100 rounded-t-sm h-[40%]"></div>
                      <div className="flex-1 bg-blue-200 rounded-t-sm h-[60%]"></div>
                      <div className="flex-1 bg-blue-400 rounded-t-sm h-[85%]"></div>
                      <div className="flex-1 bg-blue-600 rounded-t-sm h-[100%]"></div>
                      <div className="flex-1 bg-blue-300 rounded-t-sm h-[70%]"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Notification */}
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-12 bottom-1/4 z-20 bg-slate-900 p-5 rounded-2xl shadow-2xl hidden xl:flex items-center gap-4 border border-slate-800"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Results Published</p>
                    <p className="text-slate-400 text-[10px]">Semester 4 • 12:40 PM</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-50 bg-slate-50/30">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem label="Active Students" value="12k+" />
            <StatItem label="Institutions" value="450+" />
            <StatItem label="Results Processed" value="2.5M" />
            <StatItem label="Uptime" value="99.9%" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl mx-auto text-center mb-24 space-y-4">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Core Capabilities</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">Everything you need to manage academic excellence.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FiShield className="text-3xl" />}
              title="Secure Role Management"
              desc="Granular permissions for Head, Teachers, and Students with encrypted data access."
              color="blue"
            />
            <FeatureCard 
              icon={<FiBarChart2 className="text-3xl" />}
              title="Advanced Analytics"
              desc="Beautifully visualized performance trends and semester-wise progress tracking."
              color="indigo"
            />
            <FeatureCard 
              icon={<FiAward className="text-3xl" />}
              title="Automated Grading"
              desc="Smart GPA/CGPA calculations based on the latest 2026 academic standards."
              color="purple"
            />
            <FeatureCard 
              icon={<FiSmartphone className="text-3xl" />}
              title="Mobile Experience"
              desc="A responsive, glassmorphic interface that works perfectly on any device."
              color="pink"
            />
            <FeatureCard 
              icon={<FiBookOpen className="text-3xl" />}
              title="Digital Curriculum"
              desc="Dynamic subject management updated in real-time across all dashboards."
              color="orange"
            />
            <FeatureCard 
              icon={<FiUsers className="text-3xl" />}
              title="Instant Results"
              desc="Publish marks instantly with automated notifications and downloadable PDF reports."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight">EduResult</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed font-medium">
                The next generation of educational management. Built for precision, designed for simplicity, and scaled for the future.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Platform</h4>
              <ul className="space-y-4 font-bold text-slate-300">
                <li><Link to="/login" className="hover:text-blue-400 transition">Dashboard</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition">Curriculum</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Analytics</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Support</h4>
              <ul className="space-y-4 font-bold text-slate-300">
                <li><a href="#" className="hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm font-bold">© 2026 EduResult Technologies. All rights reserved.</p>
            <div className="flex space-x-8 text-sm font-bold text-slate-500">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="group space-y-3 p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <p className="text-5xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{value}</p>
    <div className="flex flex-col items-center">
      <div className="h-1 w-8 bg-blue-600 rounded-full mb-3 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-200 bg-blue-50 text-blue-600",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200 bg-indigo-50 text-indigo-600",
    purple: "from-purple-500 to-purple-600 shadow-purple-200 bg-purple-50 text-purple-600",
    pink: "from-pink-500 to-pink-600 shadow-pink-200 bg-pink-50 text-pink-600",
    orange: "from-orange-500 to-orange-600 shadow-orange-200 bg-orange-50 text-orange-600",
    green: "from-green-500 to-green-600 shadow-green-200 bg-green-50 text-green-600"
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="relative p-10 bg-white rounded-[3rem] border border-slate-100 hover:border-blue-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 group overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 ${colors[color].split(' shadow')[0]} group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-current/10`}>
        <div className="text-3xl text-current">{icon}</div>
      </div>
      
      <div className="relative space-y-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium text-lg">{desc}</p>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-50 flex items-center text-sm font-black text-blue-600 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
        Learn more <FiArrowRight className="ml-2" />
      </div>
    </motion.div>
  );
};

export default LandingPage;
