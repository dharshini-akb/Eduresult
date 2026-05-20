import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', employeeId: '', department: 'Computer Science'
  });

  const departmentsList = ['Computer Science', 'EEE', 'AIDS', 'ECE', 'Information Technology'];

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    const { data } = await axios.get('/api/admin/teachers', config);
    setTeachers(data);
  };

  const filteredTeachers = teachers.filter(teacher => {
    if (selectedDepartment === 'All') return true;
    return teacher.department === selectedDepartment;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await axios.put(`/api/admin/teachers/${editingTeacher._id}`, formData, config);
      } else {
        await axios.post('/api/admin/teachers', formData, config);
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', email: '', password: '', employeeId: '', department: 'Computer Science' });
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving teacher');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.userId.name,
      email: teacher.userId.email,
      password: '',
      employeeId: teacher.employeeId,
      department: teacher.department
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      await axios.delete(`/api/admin/teachers/${id}`, config);
      fetchTeachers();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Teacher Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage faculty members across departments</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            className="p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departmentsList.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/20"
          >
            <FiPlus /> <span>Add Teacher</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">Employee ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{teacher.employeeId}</td>
                <td className="px-6 py-4 font-medium dark:text-slate-200">{teacher.userId?.name}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
                    {teacher.department}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => handleEdit(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(teacher._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTeachers.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 mt-4">
            <p className="text-slate-400 font-bold">No teachers found in {selectedDepartment === 'All' ? 'any department' : selectedDepartment}.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"><FiX className="text-2xl text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" placeholder="Full Name" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              {!editingTeacher && <input type="password" placeholder="Password" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />}
              <input type="text" placeholder="Employee ID" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} />
              
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Department</label>
                <select 
                  required 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none dark:text-white" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition mt-4">
                {editingTeacher ? 'Update Teacher' : 'Save Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
