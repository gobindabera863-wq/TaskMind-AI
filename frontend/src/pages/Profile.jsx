import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, ShieldCheck, Key, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl w-full mx-auto px-6 py-6 flex-1 flex gap-6">
        <Sidebar />

        <main className="flex-1 flex flex-col gap-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl max-w-2xl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">{user?.name}</h2>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">Authenticated TaskMind AI Account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <User className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">Full Name</p>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">Email Address</p>
                  <p className="text-sm font-bold text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">Authentication Strategy</p>
                  <p className="text-sm font-bold text-white">JWT Bearer Token + Bcrypt Hashing</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
