import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, LogOut, CheckCircle2, User, LayoutDashboard } from 'lucide-react';

const Navbar = ({ onOpenAiChat }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/70 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              TaskMind AI
            </h1>
            <p className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400">
              Smart Productivity
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-slate-300 hover:text-white font-medium text-sm transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
