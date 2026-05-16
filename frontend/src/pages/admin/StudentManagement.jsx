import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', registerNumber: '', department: '', semester: 1, section: 'A'
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => { 
    fetchStudents(); 
    fetchSubjects();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/admin/students', config);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/api/admin/subjects', config);
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const departments = [...new Set(subjects.map(s => s.department))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`http://127.0.0.1:5000/api/admin/students/${editingStudent._id}`, formData, config);
      } else {
        await axios.post('http://127.0.0.1:5000/api/admin/students', formData, config);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', password: '', registerNumber: '', department: '', semester: 1, section: 'A' });
      fetchStudents();
      alert(editingStudent ? 'Student updated successfully!' : 'Student added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.userId.name,
      email: student.userId.email,
      password: '',
      registerNumber: student.registerNumber,
      department: student.department,
      semester: student.semester,
      section: student.section
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await axios.delete(`http://127.0.0.1:5000/api/admin/students/${id}`, config);
      fetchStudents();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Student Management</h3>
        <button
          onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <FiPlus /> <span>Add Student</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-gray-500 text-sm">
              <th className="px-6 py-4">Reg No</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Semester</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-gray-800">{student.registerNumber}</td>
                <td className="px-6 py-4">{student.userId?.name}</td>
                <td className="px-6 py-4">{student.department}</td>
                <td className="px-6 py-4">{student.semester}</td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(student._id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-10 text-gray-500 font-medium">
            No students found. Use the "Add Student" button to create new records.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h4>
              <button onClick={() => setIsModalOpen(false)}><FiX className="text-2xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              {!editingStudent && <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />}
              <input type="text" placeholder="Register Number" required className="w-full p-3 border rounded-xl" value={formData.registerNumber} onChange={(e) => setFormData({...formData, registerNumber: e.target.value})} />
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Department</label>
                <select 
                  required 
                  className="w-full p-3 border rounded-xl bg-white" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  {/* Fallback for common aliases */}
                  {!departments.includes('Computer Science') && <option value="Computer Science">Computer Science</option>}
                  {!departments.includes('IT') && <option value="IT">IT</option>}
                </select>
              </div>

              <div className="flex space-x-4">
                <input type="number" placeholder="Semester" required className="w-1/2 p-3 border rounded-xl" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
                <input type="text" placeholder="Section" required className="w-1/2 p-3 border rounded-xl" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                {editingStudent ? 'Update Student' : 'Save Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
