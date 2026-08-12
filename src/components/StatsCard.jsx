import React from 'react';

const StatsCard = ({ title, value, icon, subtext, color = "indigo" }) => {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    red: "from-red-500/20 to-pink-500/10 border-red-500/30 text-red-400"
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl rounded-2xl p-5 shadow-xl flex items-center justify-between`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h3 className="text-2xl font-extrabold text-white mt-1">
          {value}
        </h3>
        {subtext && (
          <p className="text-[11px] font-medium text-slate-400 mt-1">
            {subtext}
          </p>
        )}
      </div>

      <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center text-2xl shadow-inner border border-white/5">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
