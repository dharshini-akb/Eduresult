import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAward, FiBook, FiDownload, FiUser, FiMail, FiPhone,
  FiLock, FiStar, FiTrendingUp, FiCreditCard, FiHash
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import StudentPortalLayout from '../../components/student/StudentPortalLayout';
import { useAuth } from '../../context/AuthContext';
import {
  GRADE_OPTIONS, calculateCGPA, getGradePoint, getCredits,
  getProfileImageUrl, loadImageAsDataUrl, getStandingLabel
} from '../../utils/gpa';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  results: 'My Results',
  download: 'Download Center',
  notifications: 'Notifications',
  profile: 'Profile',
};

const authConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { headers: { Authorization: `Bearer ${userInfo.token}` } };
};

const semGpa = (list) => {
  let credits = 0;
  let points = 0;
  list.forEach((r) => {
    const c = getCredits(r);
    const p = getGradePoint(r);
    credits += c;
    points += p * c;
  });
  return credits > 0 ? (points / credits).toFixed(2) : '0.00';
};

const letterFromGpa = (gpa) => {
  const v = parseFloat(gpa);
  if (v >= 9) return 'O';
  if (v >= 8) return 'A';
  if (v >= 7) return 'B+';
  if (v >= 6) return 'B';
  if (v >= 5) return 'C';
  return 'F';
};

const StudentDashboard = () => {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [semesterStatus, setSemesterStatus] = useState({});
  const [toppers, setToppers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const config = authConfig();
      const [dashRes, notifsRes] = await Promise.allSettled([
        axios.get('/api/student/dashboard', config),
        axios.get('/api/notifications', config),
      ]);

      if (dashRes.status === 'fulfilled') {
        const { profile: p, results: r, curriculum: c, semesterStatus: st } = dashRes.value.data;
        setProfile(p);
        setResults(r);
        setCurriculum(c);
        setSemesterStatus(st || {});
        
        const sems = [...new Set(r.map((x) => String(x.semester)))].sort((a, b) => a - b);
        const latest = sems[sems.length - 1] || String(p?.semester || '1');
        setSelectedSemester(latest);
        setProfileForm({
          name: p?.userId?.name || '',
          email: p?.userId?.email || '',
          phone: p?.userId?.phone || '',
        });
      }

      if (notifsRes.status === 'fulfilled') {
        setNotifications(notifsRes.value.data || []);
      }

    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const groupedResults = useMemo(() => {
    const g = {};
    results.forEach((r) => {
      const sem = String(r.semester);
      if (!g[sem]) g[sem] = [];
      g[sem].push(r);
    });
    return g;
  }, [results]);

  const semesterOptions = useMemo(
    () => ['1', '2', '3', '4', '5', '6', '7', '8'],
    []
  );

  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const totalCredits = useMemo(
    () => results.reduce((s, r) => s + getCredits(r), 0),
    [results]
  );
  const subjectCount = results.length;

  const myRank = useMemo(() => {
    const idx = toppers.findIndex((t) => t.student?.registerNumber === profile?.registerNumber);
    return idx >= 0 ? idx + 1 : '—';
  }, [toppers, profile]);

  const semChartData = useMemo(
    () =>
      semesterOptions.map((sem) => ({
        sem: `S${sem}`,
        gpa: parseFloat(semGpa(groupedResults[sem] || [])),
      })),
    [semesterOptions, groupedResults]
  );

  const currentSemResults = groupedResults[selectedSemester] || [];
  const currentSgpa = semGpa(currentSemResults);
  const cumulativeResultsAtSelected = useMemo(() => 
    results.filter((r) => parseInt(r.semester, 10) <= parseInt(selectedSemester || '0', 10)),
    [results, selectedSemester]
  );
  const cumulativeCgpaAtSelected = useMemo(() => 
    calculateCGPA(cumulativeResultsAtSelected),
    [cumulativeResultsAtSelected]
  );

  const canDownloadSem = (sem) => semesterStatus[sem]?.canDownload;

  const downloadMarksheet = async (sem) => {
    if (!canDownloadSem(sem)) {
      alert('Marksheet is available only when results are published.');
      return;
    }
    const semResults = (groupedResults[sem] || []).filter(r => r.subjectId);
    if (!semResults.length) {
      alert('No valid results found for this semester.');
      return;
    }
    const doc = new jsPDF();
    const name = profile?.userId?.name || 'Student';
    const imgPath = profile?.userId?.profileImage;

    doc.setFontSize(18);
    doc.text('EduResult — Semester Marksheet', 105, 18, { align: 'center' });
    let y = 28;
    if (imgPath) {
      try {
        const dataUrl = await loadImageAsDataUrl(getProfileImageUrl(imgPath, name));
        doc.addImage(dataUrl, 'JPEG', 165, 22, 28, 28);
      } catch { /* skip photo */ }
    }
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 20, y);
    doc.text(`Reg No: ${profile?.registerNumber}`, 20, y + 10);
    doc.text(`Department: ${profile?.department}`, 20, y + 20);
    doc.text(`Semester: ${sem}`, 20, y + 30);

    doc.autoTable({
      startY: y + 40,
      head: [['Subject', 'Code', 'Credits', 'Internal', 'External', 'Total', 'Grade', 'Status']],
      body: semResults.map((r) => [
        r.subjectId?.subjectName || 'N/A',
        r.subjectId?.subjectCode || 'N/A',
        r.subjectId?.credits || 0,
        r.internalMarks ?? '—',
        r.externalMarks ?? '—',
        r.total ?? '—',
        r.grade || '—',
        r.status || '—',
      ]),
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246], // Blue color matching the image
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Subject
        1: { cellWidth: 25 }, // Code
        2: { cellWidth: 15 }, // Credits
        3: { cellWidth: 18 }, // Internal
        4: { cellWidth: 18 }, // External
        5: { cellWidth: 15 }, // Total
        6: { cellWidth: 15 }, // Grade
        7: { cellWidth: 15 }, // Status
      }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    const currentSemGpa = semGpa(semResults);
    const cumulativeResults = results.filter((r) => parseInt(r.semester, 10) <= parseInt(sem, 10));
    const cumulativeCgpa = calculateCGPA(cumulativeResults);

    doc.setFontSize(12);
    doc.text(`Semester GPA: ${currentSemGpa}`, 20, finalY);
    doc.text(`Overall CGPA: ${cumulativeCgpa}`, 20, finalY + 10);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, finalY + 20);
    doc.save(`Marksheet_Sem${sem}_${profile?.registerNumber}.pdf`);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', profileForm.name);
      fd.append('email', profileForm.email);
      fd.append('phone', profileForm.phone);
      if (photoFile) fd.append('profileImage', photoFile);
      const { data } = await axios.put('/api/student/profile', fd, {
        ...authConfig(),
        headers: { ...authConfig().headers, 'Content-Type': 'multipart/form-data' },
      });
      setProfile(data);
      updateUser({
        name: data.userId?.name,
        email: data.userId?.email,
        profileImage: data.userId?.profileImage,
      });
      setPhotoFile(null);
      alert('Profile updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const hasNewResults = useMemo(() => 
    notifications.some((n) => n.type === 'result' && !n.isRead),
  [notifications]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderDashboard = () => {
    const isDarkMode = false; // Placeholder for dark mode check
    return (
      <div className="space-y-6 pb-8">
        {hasNewResults && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-600/20"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <FiAward className="text-xl" />
              </div>
              <div>
                <p className="font-bold">New Results Published!</p>
                <p className="text-sm text-blue-50">Your academic performance has been updated. Check them now.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setActiveTab('results')}
              className="w-full sm:w-auto px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition"
            >
              View Results
            </button>
          </motion.div>
        )}

        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Overall CGPA" value={cgpa} icon={<FiAward />} color="purple" />
          <StatCard label="Semester SGPA" value={currentSgpa} icon={<FiTrendingUp />} color="blue" />
          <StatCard label="Total Credits" value={totalCredits} icon={<FiCreditCard />} color="blue" />
          <StatCard label="Subjects Passed" value={subjectCount} icon={<FiBook />} color="green" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Semester Performance</h3>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="sem" tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                      borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="gpa" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Notifications</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {notifications.slice(0, 4).map((n) => (
                <div key={n._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{n.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))}
              {!notifications.length && (
                <p className="text-sm text-slate-400 text-center py-8 italic">No notifications yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg shadow-blue-600/20">
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">Download your semester marksheet</h3>
            <p className="text-blue-100 text-sm mt-1">Available when all semester results are published</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('download');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition shrink-0"
          >
            Download Now
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results.length) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAward className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No results published</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your results will appear here once they are officially published by the department.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Select Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          >
            {semesterOptions.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Semester SGPA" value={currentSgpa} icon={<FiAward />} color="blue" small />
          <StatCard label="Cumulative CGPA" value={cumulativeCgpaAtSelected} icon={<FiAward />} color="purple" small />
          <StatCard label="Standing" value={getStandingLabel(cumulativeCgpaAtSelected)} icon={<FiStar />} color="green" small />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Subject Code</th>
                  <th className="px-4 sm:px-6 py-4">Subject Name</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Credits</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Grade</th>
                  <th className="px-4 sm:px-6 py-4 text-center">GP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentSemResults.filter(r => r.subjectId).map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{r.subjectId.subjectCode}</td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-slate-800 dark:text-white">{r.subjectId.subjectName}</td>
                    <td className="px-4 sm:px-6 py-4 text-center text-slate-600 dark:text-slate-400">{getCredits(r)}</td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-black text-xs">{r.grade}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-bold text-slate-800 dark:text-white">{getGradePoint(r).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-black text-slate-700 dark:text-slate-300">
                <tr>
                  <td colSpan={2} className="px-4 sm:px-6 py-4">Total Credits: {currentSemResults.reduce((s, r) => s + getCredits(r), 0)}</td>
                  <td colSpan={3} className="px-4 sm:px-6 py-4 text-right text-blue-600 dark:text-blue-400">SGPA {currentSgpa}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderToppers = () => {
    if (!toppers.length) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrendingUp className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No rankings available yet</h3>
          <p className="text-slate-500 mt-1">Rankings and toppers will be calculated once results are published.</p>
        </div>
      );
    }
    const top3 = toppers.slice(0, 3);
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    return (
      <div className="space-y-8 pb-8">
        <div className="flex flex-col sm:flex-row justify-center items-center sm:items-end gap-6 sm:gap-4 min-h-[220px]">
          {podiumOrder.map((t, i) => {
            const rank = t === top3[0] ? 1 : t === top3[1] ? 2 : 3;
            const heights = { 1: 'sm:h-36', 2: 'sm:h-28', 3: 'sm:h-24' };
            return (
              <div key={t._id} className={`flex flex-col items-center w-full sm:w-auto ${rank === 1 ? 'order-1 sm:order-2' : rank === 2 ? 'order-2 sm:order-1' : 'order-3'}`}>
                <img
                  src={getProfileImageUrl(t.user?.profileImage, t.user?.name)}
                  alt=""
                  className={`rounded-full object-cover border-4 ${rank === 1 ? 'w-20 h-20 border-yellow-400' : 'w-16 h-16 border-slate-200'}`}
                />
                <p className="font-bold text-slate-800 dark:text-white mt-2 text-sm text-center">{t.user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.student?.registerNumber}</p>
                <p className="text-blue-600 dark:text-blue-400 font-black">{t.avgGPA?.toFixed(2)}</p>
                <div className={`hidden sm:flex ${heights[rank] || 'h-20'} w-24 mt-2 rounded-t-xl ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-300' : 'bg-amber-700'} items-center justify-center text-white font-black text-xl`}>
                  #{rank}
                </div>
                <div className="sm:hidden mt-2 px-4 py-1 rounded-full bg-blue-600 text-white font-black text-sm">
                  Rank #{rank}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {toppers.map((t, i) => (
                  <tr key={t._id} className={t.student?.registerNumber === profile?.registerNumber ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}>
                    <td className="px-6 py-4 font-bold dark:text-white">{i + 1}</td>
                    <td className="px-6 py-4 font-medium dark:text-white">{t.user?.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{t.student?.registerNumber}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{t.student?.department}</td>
                    <td className="px-6 py-4 text-right font-black text-blue-600 dark:text-blue-400">{t.avgGPA?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDownload = () => (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {semesterOptions.map((sem) => {
          const stats = semesterStatus[sem];
          const isReady = canDownloadSem(sem);
          const subtitle = isReady 
            ? `Ready to download (${stats?.publishedCount}/${stats?.totalSubjects} subjects)`
            : `Waiting for results (${stats?.publishedCount || 0}/${stats?.totalSubjects || 0} published)`;
          
          return (
            <DownloadCard
              key={sem}
              title={`Semester ${sem} Marksheet`}
              subtitle={subtitle}
              locked={!isReady}
              onDownload={() => downloadMarksheet(sem)}
            />
          );
        })}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm mb-8">
      {notifications.length ? notifications.map((n) => (
        <div key={n._id} className="p-5">
          <p className="font-bold text-slate-800 dark:text-white">{n.title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
        </div>
      )) : (
        <p className="p-12 text-center text-slate-400 italic">No notifications</p>
      )}
    </div>
  );

  const renderProfile = () => (
    <form onSubmit={saveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm h-fit">
        <img
          src={photoFile ? URL.createObjectURL(photoFile) : getProfileImageUrl(profile?.userId?.profileImage, profileForm.name)}
          alt=""
          className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-100 dark:border-blue-900/50"
        />
        <label className="mt-4 inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        </label>
        <h3 className="mt-4 text-xl font-black text-slate-800 dark:text-white">{profileForm.name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{profile?.registerNumber}</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-blue-600 dark:text-blue-400 font-black text-2xl">CGPA {cgpa}</p>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            {getStandingLabel(cgpa)}
          </span>
        </div>
      </div>
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Edit Personal Information</h3>
        <div className="space-y-4">
          <Field label="Full name" icon={<FiUser />} value={profileForm.name} onChange={(v) => setProfileForm((f) => ({ ...f, name: v }))} />
          <Field label="Email" icon={<FiMail />} type="email" value={profileForm.email} onChange={(v) => setProfileForm((f) => ({ ...f, email: v }))} />
          <Field label="Phone" icon={<FiPhone />} value={profileForm.phone} onChange={(v) => setProfileForm((f) => ({ ...f, phone: v }))} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Info label="Department" value={profile?.department} icon={<FiBook />} />
          <Info label="Semester" value={`Semester ${profile?.semester}`} icon={<FiHash />} />
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary w-full sm:w-auto px-10 py-4 disabled:opacity-60 shadow-blue-600/20">
          {savingProfile ? 'Saving Changes…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  return (
    <StudentPortalLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      profile={profile}
      pageTitle={PAGE_TITLES[activeTab] || 'Dashboard'}
    >
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'results' && renderResults()}
          {activeTab === 'toppers' && renderToppers()}
          {activeTab === 'download' && renderDownload()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'profile' && renderProfile()}
        </motion.div>
      </AnimatePresence>
    </StudentPortalLayout>
  );
};

const StatCard = ({ label, value, icon, color, small }) => {
  const colors = {
    purple: 'from-violet-500 to-purple-600 shadow-violet-500/20',
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-green-600 shadow-green-500/20',
  };
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ${small ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} shadow-sm flex items-center gap-3 sm:gap-4`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center shrink-0 shadow-lg`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`font-black text-slate-900 dark:text-white ${small ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} truncate`}>{value}</p>
      </div>
    </div>
  );
};

const DownloadCard = ({ title, subtitle, onDownload, locked, icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
    <motion.div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
      {icon || <FiDownload className="text-xl" />}
    </motion.div>
    <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex-1 leading-relaxed">{subtitle}</p>
    <button
      type="button"
      disabled={locked}
      onClick={onDownload}
      className={`mt-6 w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
        locked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
      }`}
    >
      {locked ? <FiLock /> : <FiDownload />} Download
    </button>
  </div>
);

const Field = ({ label, icon, value, onChange, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-xl px-4 py-3 focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
      <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-white" />
    </div>
  </div>
);

const Info = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
    <span className="text-blue-600 dark:text-blue-400 text-lg">{icon}</span>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
      <p className="font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
