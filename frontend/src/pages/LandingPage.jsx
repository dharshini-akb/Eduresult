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
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-8 py-4 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <FiBookOpen className="text-2xl text-white" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">EduResult</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center space-x-8"
        >
          <a href="#features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">Features</a>
          <a href="#about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">About</a>
          <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300">
            Sign In
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="container mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">New Curriculum 2026 Live</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight"
              >
                Modern Result <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Management</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Empower your institution with real-time analytics, automated grading, and a seamless experience for teachers and students.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link to="/login" className="group px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300 flex items-center gap-2">
                  Launch Dashboard
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 bg-white text-slate-600 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                  View Demo
                </button>
              </motion.div>
            </div>

            <div className="lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative z-10"
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-[3rem] blur-2xl"></div>
                <img 
                  src="/src/assets/hero.png" 
                  alt="Dashboard Preview" 
                  className="rounded-[2.5rem] shadow-2xl border-8 border-white relative z-10"
                />
              </motion.div>
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Status</p>
                    <p className="text-sm font-black text-slate-800">All Nodes Active</p>
                  </div>
                </div>
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
  <div className="space-y-1">
    <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white shadow-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white shadow-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white shadow-purple-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600 group-hover:text-white shadow-pink-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white shadow-orange-100",
    green: "bg-green-50 text-green-600 border-green-100 group-hover:bg-green-600 group-hover:text-white shadow-green-100"
  };

  return (
    <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-transparent hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 border shadow-lg ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
};

export default LandingPage;
