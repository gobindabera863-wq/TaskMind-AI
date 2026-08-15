import React from 'react';

const StatsCard = ({ title, value, icon, subtext, color = "indigo", onClick, isActive = false }) => {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400 hover:border-indigo-400",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400 hover:border-amber-400",
    red: "from-red-500/20 to-pink-500/10 border-red-500/30 text-red-400 hover:border-red-400",
    purple: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400 hover:border-purple-400",
    cyan: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400 hover:border-cyan-400",
    blue: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400 hover:border-blue-400",
    pink: "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400 hover:border-pink-400"
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.indigo} border backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-xl flex items-center justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${
        isActive ? 'ring-2 ring-white/80 shadow-2xl scale-[1.02]' : ''
      }`}
    >
      <div>
        <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
          {value}
        </h3>
        {subtext && (
          <p className="text-[10px] md:text-[11px] font-medium text-slate-400 mt-1">
            {subtext}
          </p>
        )}
      </div>

      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-900/50 flex items-center justify-center text-xl md:text-2xl shadow-inner border border-white/5 shrink-0">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;


