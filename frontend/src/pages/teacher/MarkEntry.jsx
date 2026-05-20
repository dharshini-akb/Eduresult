import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiInfo, FiBriefcase, FiBookOpen, FiSend, FiAlertCircle } from 'react-icons/fi';

const MarkEntry = () => {
  const [subjects, setSubjects] = useState([]);
  const [pendingExternal, setPendingExternal] = useState([]);
  const [teacherDept, setTeacherDept] = useState(null);
  const [activeSemester, setActiveSemester] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [batchStatus, setBatchStatus] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [internalEnteredCount, setInternalEnteredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const isHead = user.role === 'head' || user.role === 'admin';
  const isTeacher = user.role === 'teacher';

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const { data } = await axios.get('/api/teacher/subjects', config);
      const list = Array.isArray(data) ? data : data.subjects || [];
      setSubjects(list);
      setPendingExternal(data.pendingExternal || []);
      setTeacherDept(data.department || user.department || null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const headSubjects = useMemo(() => {
    if (!isHead) return subjects;
    const pendingIds = new Set(
      pendingExternal.map((b) => (b.subjectId?._id || b.subjectId)?.toString())
    );
    return subjects.map((s) => ({
      ...s,
      awaitingExternal: pendingIds.has(s._id?.toString()),
      markStatus: pendingExternal.find(
        (b) => (b.subjectId?._id || b.subjectId)?.toString() === s._id?.toString()
      ),
    }));
  }, [subjects, pendingExternal, isHead]);

  const displaySubjects = isHead ? headSubjects : subjects;

  const filteredSubjects = useMemo(() => {
    let list = displaySubjects;
    if (activeSemester !== 'All') {
      list = list.filter((s) => s.semester === parseInt(activeSemester, 10));
    }
    if (isHead) {
      list = [...list].sort(
        (a, b) => (b.awaitingExternal ? 1 : 0) - (a.awaitingExternal ? 1 : 0)
      );
    }
    return list;
  }, [displaySubjects, activeSemester, isHead]);

  const groupedBySemester = useMemo(() => {
    const groups = {};
    filteredSubjects.forEach((sub) => {
      if (!groups[sub.semester]) groups[sub.semester] = [];
      groups[sub.semester].push(sub);
    });
    return groups;
  }, [filteredSubjects]);

  const selectedSub = subjects.find((s) => s._id === selectedSubject);

  const loadStudents = async (sub) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        subjectId: sub._id,
        semester: String(sub.semester),
        department: sub.department,
      });
      const { data } = await axios.get(`/api/teacher/students-for-marks?${params}`, config);
      setStudents(data.students || data);
      setBatchStatus(data.batchStatus || null);
      setStudentCount(data.studentCount || (data.students || data).length);
      setInternalEnteredCount(data.internalEnteredCount || 0);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = async (sub) => {
    setSelectedSubject(sub._id);
    await loadStudents(sub);
  };

  const handleMarkUpdate = async (studentId, marks) => {
    if (marks === '') return;
    const numericMarks = Number(marks);
    if (Number.isNaN(numericMarks)) return;

    const sub = subjects.find((s) => s._id === selectedSubject);
    if (!sub) return;

    try {
      await axios.post(
        '/api/teacher/marks',
        {
          studentId,
          subjectId: selectedSubject,
          semester: sub.semester,
          marks: numericMarks,
          type: isHead ? 'external' : 'internal',
        },
        config
      );
      await loadStudents(sub);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating marks');
    }
  };

  const submitInternalToHead = async () => {
    const sub = subjects.find((s) => s._id === selectedSubject);
    if (!sub) return;
    if (
      !window.confirm(
        `Submit internal marks for ${sub.subjectName} to Head? You will not be able to edit them after submission.`
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        '/api/teacher/submit-internal',
        { subjectId: selectedSubject, semester: sub.semester },
        config
      );
      alert('Internal marks submitted. Head has been notified to enter external marks.');
      await loadStudents(sub);
      await loadSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit internal marks');
    } finally {
      setSubmitting(false);
    }
  };

  const publishResults = async () => {
    const sub = subjects.find((s) => s._id === selectedSubject);
    if (!sub) return;
    if (
      !window.confirm(
        `Publish results for ${sub.subjectName}? Students can download marksheet when all semester subjects are complete.`
      )
    ) {
      return;
    }
    try {
      await axios.post(
        '/api/teacher/publish',
        { semester: sub.semester, subjectId: selectedSubject },
        config
      );
      alert('Results published successfully.');
      await loadStudents(sub);
      await loadSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing results');
    }
  };

  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
  const internalLocked = batchStatus?.internalSubmitted;
  const published = batchStatus?.published;
  const canSubmitInternal =
    isTeacher &&
    !internalLocked &&
    studentCount > 0 &&
    internalEnteredCount >= studentCount;
  const canPublish =
    isHead &&
    !published &&
    studentCount > 0 &&
    students.length > 0 &&
    students.every((s) => (s.marks?.external !== undefined && s.marks?.external !== null) || s.marks?.internalStatus === 'Fail');

  if (loadingSubjects) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center text-slate-500">
        Loading subjects…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FiBriefcase className="text-blue-600 dark:text-blue-400" />
            <span>Mark Management</span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">Enter and manage student examination performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {semesters.map(s => (
            <button
              key={s}
              onClick={() => setActiveSemester(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeSemester === s 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'All' ? 'All Semesters' : `Sem ${s}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          {Object.keys(groupedBySemester).sort().map(sem => (
            <div key={sem} className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Semester {sem}</h4>
              <div className="grid gap-3">
                {groupedBySemester[sem].map(sub => (
                  <button
                    key={sub._id}
                    onClick={() => selectSubject(sub)}
                    className={`p-5 rounded-2xl border-2 text-left transition relative group overflow-hidden ${
                      selectedSubject === sub._id 
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                        : 'border-transparent bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    {sub.awaitingExternal && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-bl-xl shadow-lg animate-pulse">
                        Pending External
                      </div>
                    )}
                    <h5 className={`font-black text-base ${selectedSubject === sub._id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                      {sub.subjectName}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-tight">{sub.subjectCode}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sub.markStatus?.published ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {sub.markStatus?.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filteredSubjects.length === 0 && (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <FiBookOpen className="text-4xl text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">No subjects assigned.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedSubject ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white">{selectedSub?.subjectName}</h4>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{selectedSub?.subjectCode}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 hidden sm:block"></span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Semester {selectedSub?.semester}</p>
                    </div>
                  </div>
                  {isTeacher && !internalLocked && (
                    <button
                      onClick={submitInternalToHead}
                      disabled={!canSubmitInternal || submitting}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition shadow-lg ${
                        canSubmitInternal 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <FiSend /> {submitting ? 'Submitting...' : 'Submit to Head'}
                    </button>
                  )}
                  {isHead && !published && (
                    <button
                      onClick={publishResults}
                      disabled={!canPublish}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition shadow-lg ${
                        canPublish 
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <FiCheckCircle /> Publish Final Results
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{studentCount}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                      {published ? 'Finalized' : internalLocked ? 'Awaiting Head' : 'Draft'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{isHead ? 'External' : 'Internal'}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-8 py-5">Register No</th>
                      <th className="px-8 py-5">Student Name</th>
                      <th className="px-8 py-5 text-center">{isHead ? 'External (60)' : 'Internal (40)'}</th>
                      <th className="px-8 py-5 text-center">Current Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-300">{student.registerNumber}</td>
                        <td className="px-8 py-5 font-bold text-slate-800 dark:text-white">{student.name}</td>
                        <td className="px-8 py-5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={isHead ? 60 : 40}
                            disabled={published || (isTeacher && internalLocked)}
                            defaultValue={isHead ? student.marks?.external : student.marks?.internal}
                            onBlur={(e) => handleMarkUpdate(student._id, e.target.value)}
                            className="w-20 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-black text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition"
                          />
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-lg font-black text-sm ${
                            student.marks?.internalStatus === 'Fail' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          }`}>
                            {student.marks?.internalStatus === 'Fail' ? 'Internal Fail' : ((student.marks?.internal || 0) + (student.marks?.external || 0))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <FiInfo className="text-4xl text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">Select a Subject</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium">Click on any subject card on the left to start entering examination marks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkEntry;
