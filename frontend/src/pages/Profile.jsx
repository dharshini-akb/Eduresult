import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiBriefcase, FiHash, FiCamera } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl } from '../utils/gpa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/teacher/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(data);
      setForm({
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        employeeId: data.employeeId || '',
        department: data.department || '',
      });
      setPreviewUrl(getProfileImageUrl(data.user?.profileImage, data.user?.name));
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      if (form.employeeId) formData.append('employeeId', form.employeeId);
      if (form.department) formData.append('department', form.department);
      if (photoFile) formData.append('profileImage', photoFile);

      const { data } = await axios.put('/api/teacher/profile', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser({
        name: data.user.name,
        email: data.user.email,
        profileImage: data.user.profileImage,
      });

      setProfile(data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-6 w-full md:w-auto">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt={form.name}
                  className="w-48 h-48 rounded-3xl object-cover border-4 border-blue-100 dark:border-blue-900/30 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <label className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95">
                  <FiCamera className="text-xl" />
                  <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                </label>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{form.name}</h2>
                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm mt-1">{user.role}</p>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 w-full space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                {profile.employeeId && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                    <div className="relative group">
                      <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.employeeId}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/30 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {profile.department && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <div className="relative group">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.department}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/30 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Profile Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
