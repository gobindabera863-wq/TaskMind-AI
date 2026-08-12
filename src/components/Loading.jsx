import React from 'react';

const Loading = ({ fullScreenScreenMessage }) => {
  if (fullScreenScreenMessage) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wide text-gray-300">{fullScreenScreenMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 text-indigo-400">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
