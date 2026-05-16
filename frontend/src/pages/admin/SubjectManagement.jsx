import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiX, FiFilter, FiBookOpen } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSemester, setActiveSemester] = useState('All');
  const [formData, setFormData] = useState({
    subjectName: '', subjectCode: '', semester: 1, department: 'Computer Science'
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/admin/subjects', config);
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const groupedSubjects = useMemo(() => {
    const groups = {};
    const filtered = activeSemester === 'All' 
      ? subjects 
      : subjects.filter(s => s.semester === parseInt(activeSemester));
    
    filtered.forEach(sub => {
      if (!groups[sub.semester]) groups[sub.semester] = [];
      groups[sub.semester].push(sub);
    });
    return groups;
  }, [subjects, activeSemester]);

  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/subjects', formData, config);
      setIsModalOpen(false);
      setFormData({ subjectName: '', subjectCode: '', semester: 1, department: 'Computer Science' });
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/admin/subjects/${id}`, config);
        fetchSubjects();
      } catch (err) {
        alert('Error deleting subject');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiBookOpen className="text-blue-600" />
              Curriculum Management
            </h3>
            <p className="text-slate-500">View and manage subjects by academic semester</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <FiPlus /> <span className="font-semibold">Add New Subject</span>
          </button>
        </div>

        {/* Semester Filter */}
        <div className="flex flex-wrap gap-2 mb-10 p-1 bg-slate-100 rounded-2xl w-fit">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveSemester(sem)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeSemester === sem
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {sem === 'All' ? 'All Semesters' : `Sem ${sem}`}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {Object.keys(groupedSubjects).sort().map(sem => (
            <div key={sem} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="px-4 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">
                  Semester {sem}
                </div>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                  {groupedSubjects[sem].map((subject) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={subject._id} 
                      className="p-6 rounded-3xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <button
                          onClick={() => handleDelete(subject._id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      
                      <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition-colors pr-8">
                        {subject.subjectName}
                      </h4>
                      <p className="text-sm text-slate-400 font-mono mb-4 uppercase tracking-wider">
                        {subject.subjectCode}
                      </p>
                      
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          {subject.department}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(groupedSubjects).length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <FiBookOpen className="mx-auto text-4xl text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No subjects found for this semester.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-bold text-slate-800">Add New Subject</h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition"
              >
                <FiX className="text-2xl text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 ml-1">Subject Name</label>
                <input type="text" placeholder="e.g. Data Structures" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 ml-1">Subject Code</label>
                <input type="text" placeholder="e.g. CSE301" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.subjectCode} onChange={(e) => setFormData({...formData, subjectCode: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 ml-1">Semester</label>
                  <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 ml-1">Department</label>
                  <input type="text" placeholder="e.g. CS" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition mt-4">
                Create Subject
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
