import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Zap, Bot, BarChart3 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">TaskMind AI</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Productivity Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
          Plan Smarter. Work Better.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Finish Faster.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 mt-6 max-w-2xl leading-relaxed">
          TaskMind AI combines full-stack MERN security, smart natural language task entry, automated task breakdown, AI prioritization, and productivity analytics into one seamless platform.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
            <Bot className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Natural Language Parsing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Type naturally like "Submit quarterly report tomorrow at 5pm priority high #work" and AI auto-detects title, deadline, priority & tag.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
            <Zap className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">AI Task Breakdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter any complex project or goal, and AI instantly decomposes it into step-by-step actionable sub-tasks.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
            <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Multi-User Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full JWT authentication + bcrypt password hashing. Every user's task data is strictly isolated and protected.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 z-10">
        TaskMind AI © 2026 — Portfolio-Ready MERN Stack Application
      </footer>
    </div>
  );
};

export default Landing;
