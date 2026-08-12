import React from 'react';

const EmptyState = ({ title = "No tasks found", message = "Get started by creating a new task or generating one using AI natural language input!", actionBtn }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl">
      <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner">
        ✨
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{message}</p>
      {actionBtn}
    </div>
  );
};

export default EmptyState;
