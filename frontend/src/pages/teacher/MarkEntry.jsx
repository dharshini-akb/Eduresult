import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiCheckCircle, FiInfo } from 'react-icons/fi';

const MarkEntry = ({ portalType }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const isHead = portalType === 'head';

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await axios.get('http://127.0.0.1:5000/api/teacher/subjects', config);
      setSubjects(data);
    };
    fetchSubjects();
  }, []);

  const handleSubjectChange = async (e) => {
    const subId = e.target.value;
    setSelectedSubject(subId);
    if (!subId) return;

    setLoading(true);
    try {
      const sub = subjects.find(s => s._id === subId);
      const { data } = await axios.get(`http://127.0.0.1:5000/api/teacher/students-for-marks?subjectId=${subId}&semester=${sub.semester}&department=${sub.department}`, config);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUpdate = async (studentId, marks) => {
    if (marks === '') return;
    const numericMarks = Number(marks);
    if (isNaN(numericMarks)) return;

    try {
      const sub = subjects.find(s => s._id === selectedSubject);
      await axios.post('http://127.0.0.1:5000/api/teacher/marks', {
        studentId,
        subjectId: selectedSubject,
        semester: sub.semester,
        marks: numericMarks,
        type: isHead ? 'external' : 'internal'
      }, config);
      
      // Update local state to reflect change
      setStudents(students.map(s => {
        if (s._id === studentId) {
          const newInternal = isHead ? (s.marks?.internal || 0) : Number(marks);
          const newExternal = isHead ? Number(marks) : (s.marks?.external || 0);
          const newTotal = newInternal + newExternal;
          const newStatus = newTotal >= 50 ? 'Pass' : 'Fail';
          
          return { 
            ...s, 
            marks: { 
              ...s.marks, 
              internal: newInternal, 
              external: newExternal,
              total: newTotal,
              status: newStatus
            } 
          };
        }
        return s;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating marks');
    }
  };

  const publishResults = async () => {
    if (!selectedSubject) return;
    const sub = subjects.find(s => s._id === selectedSubject);
    if (window.confirm(`Are you sure you want to publish results for ${sub.subjectName}? Students will be able to see their marks.`)) {
      try {
        await axios.post('http://127.0.0.1:5000/api/teacher/publish', {
          semester: sub.semester,
          department: sub.department
        }, config);
        alert('Results published successfully! Students can now view their marks.');
      } catch (err) {
        alert('Error publishing results');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Mark Entry</h3>
          <p className="text-sm text-gray-500">
            {isHead ? 'Enter External Examination Marks' : 'Enter Internal Assessment Marks'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isHead && selectedSubject && (
            <button
              onClick={publishResults}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2"
            >
              <FiCheckCircle /> Publish Results
            </button>
          )}
          <select 
            className="p-3 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            <option value="">Select Subject</option>
            {[1,2,3,4,5,6,7,8].map(sem => {
              const semSubjects = subjects.filter(s => s.semester === sem);
              if (semSubjects.length === 0) return null;
              return (
                <optgroup key={sem} label={`Semester ${sem}`}>
                  {semSubjects.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.subjectName} ({sub.subjectCode})</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      {!selectedSubject ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <FiInfo className="text-4xl text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Please select a subject to start entering marks.</p>
        </div>
      ) : loading ? (
        <div className="text-center py-20">Loading students...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold text-center">Internal (40)</th>
                <th className="px-6 py-4 font-bold text-center">External (60)</th>
                <th className="px-6 py-4 font-bold text-center">Total (100)</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.registerNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isHead ? (
                      <span className="font-medium text-gray-600">{student.marks?.internal || 0}</span>
                    ) : (
                      <input 
                        type="number" 
                        max="40"
                        className="w-20 p-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        defaultValue={student.marks?.internal || 0}
                        onBlur={(e) => handleMarkUpdate(student._id, e.target.value)}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!isHead ? (
                      <span className="font-medium text-gray-600">{student.marks?.external || 0}</span>
                    ) : (
                      <input 
                        type="number" 
                        max="60"
                        className="w-20 p-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        defaultValue={student.marks?.external || 0}
                        onBlur={(e) => handleMarkUpdate(student._id, e.target.value)}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">
                    {student.marks ? student.marks.internal + student.marks.external : 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      student.marks?.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.marks?.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-10 text-gray-500 font-medium bg-slate-50 rounded-b-2xl">
              <p>No students found for this subject.</p>
              <p className="text-xs mt-2 text-slate-400">
                Note: Students must be assigned to <strong>Semester {subjects.find(s => s._id === selectedSubject)?.semester}</strong> 
                and the <strong>{subjects.find(s => s._id === selectedSubject)?.department}</strong> department to appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkEntry;
