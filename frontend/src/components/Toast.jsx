import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen || !message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scaleUp max-w-sm w-full">
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
          isSuccess
            ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
            : isError
            ? 'bg-slate-900/95 border-red-500/40 text-red-400 shadow-red-500/10'
            : 'bg-slate-900/95 border-indigo-500/40 text-indigo-300 shadow-indigo-500/10'
        }`}
      >
        <div className="flex items-center gap-3 pr-2">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          ) : (
            <Info className="w-5 h-5 shrink-0 text-indigo-400" />
          )}
          <span className="text-xs font-bold text-slate-100 leading-snug">{message}</span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
