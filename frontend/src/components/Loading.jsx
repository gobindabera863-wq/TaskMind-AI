import React from 'react';

const Loading = ({ fullScreenScreenMessage }) => {
  if (fullScreenScreenMessage) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold tracking-wide text-slate-300">{fullScreenScreenMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 bg-slate-800 rounded-full" />
            <div className="h-4 w-20 bg-slate-800 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-800 rounded-md" />
            <div className="h-4 w-full bg-slate-800/60 rounded-md" />
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-16 bg-slate-800 rounded-md" />
            <div className="h-4 w-24 bg-slate-800 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;
