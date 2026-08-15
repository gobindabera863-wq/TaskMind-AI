import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, User, Calendar } from 'lucide-react';

const Sidebar = ({ currentCategory, onSelectCategory, tasks = [] }) => {
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Tasks', color: 'bg-white' },
    { id: 'work', label: 'Work', color: 'bg-indigo-500' },
    { id: 'personal', label: 'Personal', color: 'bg-pink-500' },
    { id: 'health', label: 'Health', color: 'bg-emerald-500' },
    { id: 'learning', label: 'Learning', color: 'bg-amber-500' },
    { id: 'finance', label: 'Finance', color: 'bg-teal-500' },
    { id: 'coding', label: 'Coding', color: 'bg-purple-500' }
  ];

  const getCategoryCount = (catId) => {
    if (catId === 'all') return tasks.length;
    return tasks.filter(
      (t) => t.category && t.category.toLowerCase().trim() === catId.toLowerCase()
    ).length;
  };

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 flex flex-col gap-6 shadow-xl h-fit">
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
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar View</span>
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

        {categories.map((cat) => {
          const count = getCategoryCount(cat.id);
          const isSelected = currentCategory?.toLowerCase() === cat.id.toLowerCase();

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span>{cat.label}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;


