import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', registerNumber: '', department: 'Computer Science', semester: 1, section: 'A'
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const departmentsList = ['Computer Science', 'EEE', 'AIDS', 'ECE', 'Information Technology'];

  useEffect(() => { 
    fetchStudents(); 
    fetchSubjects();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/admin/students', config);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/api/admin/subjects', config);
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const filteredStudents = students.filter(student => {
    if (selectedDepartment === 'All') return true;
    return student.department === selectedDepartment;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`/api/admin/students/${editingStudent._id}`, formData, config);
      } else {
        await axios.post('/api/admin/students', formData, config);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', password: '', registerNumber: '', department: 'Computer Science', semester: 1, section: 'A' });
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
      await axios.delete(`/api/admin/students/${id}`, config);
      fetchStudents();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Student Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage students and their academic records</p>
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
            onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/20"
          >
            <FiPlus /> <span>Add Student</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">Reg No</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4 text-center">Semester</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.map((student) => (
              <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{student.registerNumber}</td>
                <td className="px-6 py-4 font-medium dark:text-slate-200">{student.userId?.name}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{student.semester}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => handleEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(student._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 mt-4">
            <p className="text-slate-400 font-bold">No students found in {selectedDepartment === 'All' ? 'any department' : selectedDepartment}.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{editingStudent ? 'Edit Student' : 'Add New Student'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"><FiX className="text-2xl text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" placeholder="Full Name" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              {!editingStudent && <input type="password" placeholder="Password" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />}
              <input type="text" placeholder="Register Number" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.registerNumber} onChange={(e) => setFormData({...formData, registerNumber: e.target.value})} />
              
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

              <div className="flex space-x-4">
                <div className="w-1/2 space-y-1">
                  <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Semester</label>
                  <select required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none dark:text-white" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
                <div className="w-1/2 space-y-1">
                  <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Section</label>
                  <input type="text" placeholder="e.g. A" required className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition mt-4">
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
