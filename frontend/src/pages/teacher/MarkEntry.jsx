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
    <div className="space-y-6">
      {isHead && pendingExternal.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-900 flex items-center gap-2">
            <FiAlertCircle />
            {pendingExternal.length} subject(s) awaiting external marks
          </p>
          <p className="text-sm text-amber-800 mt-1">
            Teachers have submitted internal marks. Enter external marks (out of 60) and publish.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-amber-900">
            {pendingExternal.slice(0, 5).map((b) => (
              <li key={b._id}>
                · {b.subjectId?.subjectName} — Semester {b.semester} ({b.subjectId?.department})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiBookOpen className="text-blue-500" />
              Mark Entry
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {isHead
                ? 'Step 2: Enter external marks (out of 60) for students who passed internal, then publish.'
                : 'Step 1: Enter internal marks (out of 40). Minimum 20 to pass internal. Then submit to Head.'}
            </p>
            {isTeacher && teacherDept && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 px-3 py-2 rounded-xl">
                <FiBriefcase /> {teacherDept}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl w-fit mb-6">
          {semesters.map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => setActiveSemester(sem)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                activeSemester === sem ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
            </button>
          ))}
        </div>

        {!selectedSubject ? (
          <div className="space-y-8">
            {Object.keys(groupedBySemester).length === 0 ? (
              <div className="text-center py-16 text-slate-500">No subjects found.</div>
            ) : (
              Object.keys(groupedBySemester)
                .sort((a, b) => a - b)
                .map((sem) => (
                  <div key={sem}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">
                        Semester {sem}
                      </span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedBySemester[sem].map((sub) => (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => selectSubject(sub)}
                          className={`text-left p-5 rounded-2xl border transition group ${
                            sub.awaitingExternal
                              ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/10 hover:shadow-lg'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <h4 className="font-bold text-slate-800 dark:text-white">{sub.subjectName}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-1">{sub.subjectCode}</p>
                          {sub.markStatus?.internalSubmitted && !sub.markStatus?.published && (
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 px-2 py-0.5 rounded">
                              Awaiting external
                            </span>
                          )}
                          {sub.markStatus?.published && (
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">
                              Published
                            </span>
                          )}
                          {isTeacher && sub.markStatus?.internalSubmitted && (
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded">
                              Sent to Head
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => {
                setSelectedSubject('');
                setStudents([]);
                setBatchStatus(null);
              }}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
              ← Back to subjects
            </button>

            <div className="p-4 rounded-xl mb-4 border flex flex-wrap justify-between gap-3 items-center bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{selectedSub?.subjectName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Semester {selectedSub?.semester} · {selectedSub?.department}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isTeacher && (
                  <button
                    type="button"
                    disabled={!canSubmitInternal || submitting}
                    onClick={submitInternalToHead}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    <FiSend /> {submitting ? 'Submitting…' : 'Submit internal to Head'}
                  </button>
                )}
                {isHead && (
                  <button
                    type="button"
                    disabled={!canPublish}
                    onClick={publishResults}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    <FiCheckCircle /> Publish results
                  </button>
                )}
              </div>
            </div>

            {internalLocked && isTeacher && (
              <p className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-3 mb-4">
                Internal marks submitted. Head will enter external marks and publish results.
              </p>
            )}
            {isHead && !published && (
              <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl p-3 mb-4">
                Enter external marks below for students who passed internal. Once all marks are entered, click Publish.
              </p>
            )}
            {published && (
              <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl p-3 mb-4">
                Results published. Students can view when all semester subjects are published.
              </p>
            )}

            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading students…</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4 text-center">Internal (40)</th>
                      <th className="px-6 py-4 text-center">Internal result</th>
                      <th className="px-6 py-4 text-center">External (60)</th>
                      <th className="px-6 py-4 text-center">Total</th>
                      <th className="px-6 py-4 text-center">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{student.registerNumber}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isTeacher && !internalLocked ? (
                            <input
                              type="number"
                              max="40"
                              className="w-20 p-2 border dark:border-slate-700 rounded-lg text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                              defaultValue={student.marks?.internal ?? ''}
                              onBlur={(e) => handleMarkUpdate(student._id, e.target.value)}
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 dark:text-white">{student.marks?.internal ?? '—'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              student.marks?.internalStatus === 'Pass'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : student.marks?.internal != null
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {student.marks?.internalStatus ||
                              (student.marks?.internal != null
                                ? student.marks.internal >= 20
                                  ? 'Pass'
                                  : 'Fail'
                                : '—')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isHead &&
                          !published &&
                          student.marks?.internalStatus !== 'Fail' &&
                          (student.marks?.internal ?? 0) >= 20 ? (
                            <input
                              key={`ext-${student._id}-${selectedSubject}`}
                              type="number"
                              min="0"
                              max="60"
                              className="w-20 p-2 border dark:border-slate-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                              defaultValue={student.marks?.external ?? ''}
                              onBlur={(e) => handleMarkUpdate(student._id, e.target.value)}
                            />
                          ) : (
                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                              {student.marks?.internalStatus === 'Fail' ||
                              (student.marks?.internal != null && student.marks.internal < 20)
                                ? 'N/A'
                                : student.marks?.external ?? '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">
                          {(student.marks?.internal || 0) + (student.marks?.external || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                              student.marks?.published
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {student.marks?.published ? 'Published' : student.marks?.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkEntry;
