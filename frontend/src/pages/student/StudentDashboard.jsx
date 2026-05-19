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
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {hasNewResults && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-600/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
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
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition"
          >
            View Results
          </button>
        </motion.div>
      )}

      <motion.div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Overall CGPA" value={cgpa} icon={<FiAward />} color="purple" />
        <StatCard label="Semester SGPA" value={currentSgpa} icon={<FiTrendingUp />} color="orange" />
        <StatCard label="Total Credits" value={totalCredits} icon={<FiCreditCard />} color="blue" />
        <StatCard label="Subjects Passed" value={subjectCount} icon={<FiBook />} color="green" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Semester Performance</h3>
          <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="gpa" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Recent Notifications</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.slice(0, 4).map((n) => (
              <div key={n._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
              </div>
            ))}
            {!notifications.length && (
              <p className="text-sm text-slate-400 text-center py-8">No notifications yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">
        <div>
          <h3 className="text-xl font-bold">Download your semester marksheet</h3>
          <p className="text-violet-100 text-sm mt-1">Available when all semester results are published</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab('download');
          }}
          className="px-6 py-3 bg-white text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 shrink-0"
        >
          Download Now
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!results.length) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAward className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No results published</h3>
          <p className="text-slate-500 mt-1">Your results will appear here once they are officially published by the department.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Semester</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
        >
          {semesterOptions.map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Semester GPA (SGPA)" value={currentSgpa} icon={<FiAward />} color="orange" small />
        <StatCard label="Cumulative GPA (CGPA)" value={cumulativeCgpaAtSelected} icon={<FiAward />} color="purple" small />
        <StatCard label="Standing" value={getStandingLabel(cumulativeCgpaAtSelected)} icon={<FiStar />} color="green" small />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Subject Code</th>
              <th className="px-6 py-4">Subject Name</th>
              <th className="px-6 py-4 text-center">Credits</th>
              <th className="px-6 py-4 text-center">Grade</th>
              <th className="px-6 py-4 text-center">Grade Point</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentSemResults.filter(r => r.subjectId).map((r) => (
              <tr key={r._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-600">{r.subjectId.subjectCode}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{r.subjectId.subjectName}</td>
                <td className="px-6 py-4 text-center">{getCredits(r)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg font-bold">{r.grade}</span>
                </td>
                <td className="px-6 py-4 text-center font-semibold">{getGradePoint(r).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-slate-700">
            <tr>
              <td colSpan={2} className="px-6 py-4">Total</td>
              <td className="px-6 py-4 text-center">
                {currentSemResults.reduce((s, r) => s + getCredits(r), 0)}
              </td>
              <td colSpan={2} className="px-6 py-4 text-center text-orange-600">SGPA {currentSgpa}</td>
            </tr>
          </tfoot>
        </table>
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
      <div className="space-y-8">
        <div className="flex justify-center items-end gap-4 min-h-[220px]">
          {podiumOrder.map((t, i) => {
            const rank = t === top3[0] ? 1 : t === top3[1] ? 2 : 3;
            const heights = { 1: 'h-36', 2: 'h-28', 3: 'h-24' };
            return (
              <div key={t._id} className="flex flex-col items-center">
                <img
                  src={getProfileImageUrl(t.user?.profileImage, t.user?.name)}
                  alt=""
                  className={`rounded-full object-cover border-4 ${rank === 1 ? 'w-20 h-20 border-yellow-400' : 'w-16 h-16 border-slate-200'}`}
                />
                <p className="font-bold text-slate-800 mt-2 text-sm">{t.user?.name}</p>
                <p className="text-xs text-slate-500">{t.student?.registerNumber}</p>
                <p className="text-orange-600 font-extrabold">{t.avgGPA?.toFixed(2)}</p>
                <div className={`${heights[rank] || 'h-20'} w-24 mt-2 rounded-t-xl ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-300' : 'bg-amber-700'} flex items-center justify-center text-white font-black text-xl`}>
                  #{rank}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-right">CGPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {toppers.map((t, i) => (
                <tr key={t._id} className={t.student?.registerNumber === profile?.registerNumber ? 'bg-orange-50' : ''}>
                  <td className="px-6 py-4 font-bold">{i + 1}</td>
                  <td className="px-6 py-4">{t.user?.name}</td>
                  <td className="px-6 py-4 font-mono">{t.student?.registerNumber}</td>
                  <td className="px-6 py-4">{t.student?.department}</td>
                  <td className="px-6 py-4 text-right font-bold text-orange-600">{t.avgGPA?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDownload = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
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
    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
      {notifications.length ? notifications.map((n) => (
        <div key={n._id} className="p-5">
          <p className="font-bold text-slate-800">{n.title}</p>
          <p className="text-sm text-slate-600 mt-1">{n.message}</p>
          <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
        </div>
      )) : (
        <p className="p-12 text-center text-slate-400">No notifications</p>
      )}
    </div>
  );

  const renderProfile = () => (
    <form onSubmit={saveProfile} className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <img
          src={photoFile ? URL.createObjectURL(photoFile) : getProfileImageUrl(profile?.userId?.profileImage, profileForm.name)}
          alt=""
          className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-orange-100"
        />
        <label className="mt-4 inline-block px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold cursor-pointer">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        </label>
        <h3 className="mt-4 text-xl font-bold text-slate-800">{profileForm.name}</h3>
        <p className="text-slate-500 text-sm">{profile?.registerNumber}</p>
        <div className="mt-2 flex flex-col items-center gap-1">
          <p className="text-orange-600 font-extrabold text-lg">CGPA {cgpa}</p>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {getStandingLabel(cgpa)}
          </span>
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800">Edit profile</h3>
        <Field label="Full name" icon={<FiUser />} value={profileForm.name} onChange={(v) => setProfileForm((f) => ({ ...f, name: v }))} />
        <Field label="Email" icon={<FiMail />} type="email" value={profileForm.email} onChange={(v) => setProfileForm((f) => ({ ...f, email: v }))} />
        <Field label="Phone" icon={<FiPhone />} value={profileForm.phone} onChange={(v) => setProfileForm((f) => ({ ...f, phone: v }))} />
        <div className="grid sm:grid-cols-2 gap-4 pt-2 text-sm">
          <Info label="Department" value={profile?.department} icon={<FiBook />} />
          <Info label="Semester" value={`Semester ${profile?.semester}`} icon={<FiHash />} />
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary w-full sm:w-auto disabled:opacity-60">
          {savingProfile ? 'Saving…' : 'Save changes'}
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
    purple: 'from-violet-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-green-600',
    orange: 'from-orange-500 to-amber-600',
  };
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 ${small ? 'p-4' : 'p-5'} shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`font-extrabold text-slate-900 ${small ? 'text-xl' : 'text-2xl'}`}>{value}</p>
      </div>
    </div>
  );
};

const DownloadCard = ({ title, subtitle, onDownload, locked, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
    <motion.div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
      {icon || <FiDownload />}
    </motion.div>
    <h4 className="font-bold text-slate-800">{title}</h4>
    <p className="text-sm text-slate-500 mt-1 flex-1">{subtitle}</p>
    <button
      type="button"
      disabled={locked}
      onClick={onDownload}
      className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
        locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'
      }`}
    >
      {locked && <FiLock />} Download
    </button>
  </div>
);

const Field = ({ label, icon, value, onChange, type = 'text' }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
      <span className="text-slate-400">{icon}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 outline-none text-slate-800" />
    </div>
  </div>
);

const Info = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
    <span className="text-orange-500">{icon}</span>
    <div>
      <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
