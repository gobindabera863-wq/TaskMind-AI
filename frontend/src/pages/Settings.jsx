import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AIChat from '../components/AIChat';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import * as taskService from '../services/taskService';
import { Settings as SettingsIcon, Shield, Bell, Clock, Palette, Sparkles, Key, Save, Check, AlertCircle, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password fields
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings State
  const [prefs, setPrefs] = useState({
    theme: 'navy',
    notificationsEnabled: true,
    emailAlertsEnabled: true,
    defaultReminder: '15-min',
    aiAutoParse: true,
    aiAutoBreakdown: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, meData] = await Promise.all([
        taskService.getTasks(),
        authService.getMe()
      ]);
      setTasks(fetchedTasks);
      if (meData && meData.preferences) {
        setPrefs(prev => ({ ...prev, ...meData.preferences }));
      }
    } catch (err) {
      console.error('Error loading settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrefToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPrefs(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (passwords.newPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setErrorMsg('New password and Confirm password do not match.');
        setSaving(false);
        return;
      }
      if (passwords.newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        preferences: prefs
      };

      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }

      const updated = await authService.updateProfile(payload);
      setSuccessMsg('Settings and preferences saved successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (login) {
        login(updated);
      }
    } catch (err) {
      console.error('Error saving settings', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        <Sidebar tasks={tasks} />

        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Page Title Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-indigo-400" />
                <span>Application Settings & Preferences</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure account security, notifications, reminder lead times, and AI defaults
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. Account & Security Settings */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-extrabold text-white">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Account & Security Settings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Notification & Reminder Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Settings */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-extrabold text-white">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Notification Settings</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Desktop Web Notifications</span>
                      <span className="text-[11px] text-slate-400">Trigger browser popups for upcoming deadlines</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrefToggle('notificationsEnabled')}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        prefs.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        prefs.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Email Productivity Alerts</span>
                      <span className="text-[11px] text-slate-400">Receive weekly summary digests & OTP notifications</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrefToggle('emailAlertsEnabled')}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        prefs.emailAlertsEnabled ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        prefs.emailAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reminder Preferences */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-extrabold text-white">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Reminder Preferences</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Default Lead Time for Task Reminders
                    </label>
                    <select
                      name="defaultReminder"
                      value={prefs.defaultReminder}
                      onChange={handlePrefChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="15-min">15 minutes before due time</option>
                      <option value="30-min">30 minutes before due time</option>
                      <option value="1-hour">1 hour before due time</option>
                      <option value="1-day">1 day before due date</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Theme & AI Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Preferences */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-extrabold text-white">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Theme & Aesthetics</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Visual Style Theme
                  </label>
                  <select
                    name="theme"
                    value={prefs.theme}
                    onChange={handlePrefChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="navy">Dark Navy SaaS (Default)</option>
                    <option value="cyberpunk">Neon Purple & Cyber Glow</option>
                    <option value="slate">Glassmorphism Slate</option>
                  </select>
                </div>
              </div>

              {/* AI Preferences */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-extrabold text-white">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Engine Preferences</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Natural Language Prompt Parser</span>
                      <span className="text-[11px] text-slate-400">Extract date, time, priority & title from natural input</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrefToggle('aiAutoParse')}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        prefs.aiAutoParse ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        prefs.aiAutoParse ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">✨ AI Task Breakdown Helper</span>
                      <span className="text-[11px] text-slate-400">Enable 1-click step-by-step subtask breakdown generation</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrefToggle('aiAutoBreakdown')}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        prefs.aiAutoBreakdown ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        prefs.aiAutoBreakdown ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Application Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      <AIChat isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
    </div>
  );
};

export default Settings;
