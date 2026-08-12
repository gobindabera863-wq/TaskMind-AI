import React from 'react';

const FilterBar = ({ currentFilter, onSelectFilter, currentSort, onSelectSort }) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-xl">
      {/* Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              currentFilter === f.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Sort:</span>
        <select
          value={currentSort}
          onChange={(e) => onSelectSort(e.target.value)}
          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="dueDate">Due Date (Earliest)</option>
          <option value="priority">Highest Priority</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
