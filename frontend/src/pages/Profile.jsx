import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import AIChat from '../components/AIChat';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import * as authService from '../services/authService';
import { User, Mail, Shield, CheckCircle2, Flame, Zap, Award, Edit3, Save, Settings as SettingsIcon, Image, Loader2 } from 'lucide-react';
import { getProductivityLabel } from '../utils/helpers';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, login } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedStats, meData] = await Promise.all([
        taskService.getTasks(),
        taskService.getTaskStats(),
        authService.getMe()
      ]);
      setTasks(fetchedTasks);
      setStats(fetchedStats);
      if (meData) {
        setFormData({
          name: meData.name || '',
          email: meData.email || '',
          avatar: meData.avatar || '',
          bio: meData.bio || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePresetAvatar = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await authService.updateProfile(formData);
      setSuccessMsg('Profile updated successfully!');
      if (login) {
        login(updated);
      }
    } catch (err) {
      console.error('Error updating profile', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        <Sidebar tasks={tasks} />

        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                  <img
                    src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>{formData.name || 'User Profile'}</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Member
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formData.email}</span>
                </p>
                {formData.bio && (
                  <p className="text-xs text-slate-300 mt-1.5 italic line-clamp-1">
                    "{formData.bio}"
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-all border border-slate-700 shadow"
            >
              <SettingsIcon className="w-4 h-4 text-indigo-400" />
              <span>Manage Preferences</span>
            </Link>
          </div>

          {/* Key Metric Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Tasks Created"
              value={stats.total || 0}
              icon="📌"
              subtext="Total added goals"
              color="indigo"
            />
            <StatsCard
              title="Tasks Completed"
              value={stats.completed || 0}
              icon="✅"
              subtext="Finished tasks"
              color="emerald"
            />
            <StatsCard
              title="Completion Rate"
              value={`${stats.completionRate || 0}%`}
              icon="📊"
              subtext="Overall efficiency"
              color="purple"
            />
            <StatsCard
              title="Productivity Score"
              value={`${stats.productivityScore || 0}/100`}
              icon="⚡"
              subtext={stats.productivityLabel || getProductivityLabel(stats.productivityScore || 0)}
              color="cyan"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats.currentStreak || 0} Days`}
              icon="🔥"
              subtext="Consecutive days active"
              color="pink"
            />
          </div>

          {/* Edit Profile Form Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Edit Profile Information
              </h3>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Bio / Tagline
                </label>
                <input
                  type="text"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="e.g. Full-Stack Developer & Productivity Enthusiast"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Avatar Preset & Image URL */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-400">
                  Profile Avatar Image URL
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Preset Avatars:</span>
                  <div className="flex items-center gap-2">
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetAvatar(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                          formData.avatar === url ? 'border-indigo-500 scale-110' : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <AIChat isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
    </div>
  );
};

export default Profile;
