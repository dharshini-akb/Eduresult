import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', employeeId: '', department: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    const { data } = await axios.get('http://127.0.0.1:5000/api/admin/teachers', config);
    setTeachers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await axios.put(`http://127.0.0.1:5000/api/admin/teachers/${editingTeacher._id}`, formData, config);
      } else {
        await axios.post('http://127.0.0.1:5000/api/admin/teachers', formData, config);
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', email: '', password: '', employeeId: '', department: '' });
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
      await axios.delete(`http://127.0.0.1:5000/api/admin/teachers/${id}`, config);
      fetchTeachers();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Teacher Management</h3>
        <button
          onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <FiPlus /> <span>Add Teacher</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-gray-500 text-sm">
              <th className="px-6 py-4">Employee ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-gray-800">{teacher.employeeId}</td>
                <td className="px-6 py-4">{teacher.userId?.name}</td>
                <td className="px-6 py-4">{teacher.department}</td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(teacher._id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h4>
              <button onClick={() => setIsModalOpen(false)}><FiX className="text-2xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              {!editingTeacher && <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />}
              <input type="text" placeholder="Employee ID" required className="w-full p-3 border rounded-xl" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} />
              <input type="text" placeholder="Department" required className="w-full p-3 border rounded-xl" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
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
