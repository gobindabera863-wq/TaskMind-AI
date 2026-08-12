import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Sparkles, User, Tag } from 'lucide-react';

const Sidebar = ({ currentCategory, onSelectCategory }) => {
  const categories = [
    { id: 'all', label: 'All Tasks', color: 'bg-white' },
    { id: 'work', label: 'Work', color: 'bg-indigo-500' },
    { id: 'personal', label: 'Personal', color: 'bg-pink-500' },
    { id: 'health', label: 'Health', color: 'bg-emerald-500' },
    { id: 'learning', label: 'Learning', color: 'bg-amber-500' },
    { id: 'finance', label: 'Finance', color: 'bg-teal-500' },
    { id: 'coding', label: 'Coding', color: 'bg-purple-500' }
  ];

  return (
    <aside className="w-64 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 flex flex-col gap-6 shadow-xl">
      {/* Navigation Links */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
          Navigation
        </p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks Workspace</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <User className="w-4 h-4" />
          <span>User Profile</span>
        </NavLink>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
          Categories
        </p>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentCategory === cat.id
                ? 'bg-slate-800 text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
