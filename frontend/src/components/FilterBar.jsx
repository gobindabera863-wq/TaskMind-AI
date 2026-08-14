import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const FilterBar = ({ currentFilter, onSelectFilter, currentSort, onSelectSort }) => {
  const filters = [
    { id: 'all', label: 'All', activeClass: 'bg-indigo-600 text-white shadow-indigo-500/30' },
    { id: 'pending', label: 'Pending', activeClass: 'bg-amber-600 text-white shadow-amber-500/30' },
    { id: 'in-progress', label: 'In Progress', activeClass: 'bg-blue-600 text-white shadow-blue-500/30' },
    { id: 'completed', label: 'Completed', activeClass: 'bg-emerald-600 text-white shadow-emerald-500/30' },
    { id: 'overdue', label: 'Overdue ⚠️', activeClass: 'bg-red-600 text-white shadow-red-500/30 border border-red-500/50 animate-pulse' }
  ];

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-xl w-full">
      {/* Status Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? `${f.activeClass} shadow-md scale-[1.03]`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-1.5 transition-all">
        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">Sort:</span>
        <select
          value={currentSort}
          onChange={(e) => onSelectSort(e.target.value)}
          className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium pr-1"
        >
          <option value="newest" className="bg-slate-900 text-white py-1">Newest First</option>
          <option value="oldest" className="bg-slate-900 text-white py-1">Oldest First</option>
          <option value="dueDate" className="bg-slate-900 text-white py-1">Due Date (Earliest)</option>
          <option value="priority" className="bg-slate-900 text-white py-1">Highest Priority</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;

