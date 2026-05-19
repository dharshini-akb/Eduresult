import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiBell, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', targetAudience: 'all' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    const { data } = await axios.get('/api/admin/announcements', config);
    setAnnouncements(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/announcements', formData, config);
      setIsModalOpen(false);
      setFormData({ title: '', message: '', targetAudience: 'all' });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      await axios.delete(`/api/admin/announcements/${id}`, config);
      fetchAnnouncements();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <FiBell className="text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Manage Announcements</h3>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          <FiPlus /> <span>New Announcement</span>
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {announcements.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group"
            >
              <button
                onClick={() => handleDelete(item._id)}
                className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100 transition hover:text-red-600"
              >
                <FiTrash2 className="text-xl" />
              </button>
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.targetAudience === 'all' ? 'bg-blue-100 text-blue-600' :
                  item.targetAudience === 'teachers' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                }`}>
                  For {item.targetAudience}
                </span>
                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-gray-600 leading-relaxed">{item.message}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs text-gray-400">
                <span className="font-bold text-gray-500 mr-2">Posted by:</span> {item.author?.name}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-bold text-gray-800">New Announcement</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <FiX className="text-2xl text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Announcement Title</label>
                <input type="text" placeholder="Enter title..." required className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows="4" placeholder="Type your message here..." required className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                <select className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white" value={formData.targetAudience} onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}>
                  <option value="all">Everyone</option>
                  <option value="teachers">Teachers Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4">
                Post Announcement
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
