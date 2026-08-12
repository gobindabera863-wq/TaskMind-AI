import React from 'react';
import { Check, Trash2, Edit3, Sparkles, Calendar, Clock, AlertCircle } from 'lucide-react';
import { formatDate, isOverdue, getPriorityBadgeClass, getCategoryBadgeClass } from '../utils/helpers';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onAiBreakdown }) => {
  const isDone = task.status === 'completed';
  const overdue = isOverdue(task.dueDate, task.status);

  const subtasksTotal = task.subtasks ? task.subtasks.length : 0;
  const subtasksCompleted = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;

  return (
    <div
      className={`group relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/10 hover:border-slate-700 ${
        isDone ? 'opacity-65 bg-slate-900/40' : ''
      }`}
    >
      {/* Priority Bar Indicator */}
      <div
        className={`absolute top-0 left-6 right-6 h-1 rounded-b-md ${
          task.priority === 'urgent'
            ? 'bg-red-500'
            : task.priority === 'high'
            ? 'bg-orange-500'
            : task.priority === 'medium'
            ? 'bg-yellow-500'
            : 'bg-blue-500'
        }`}
      />

      <div className="flex items-start justify-between gap-4 mb-3 mt-1">
        {/* Custom Checkbox */}
        <button
          onClick={() => onToggleComplete(task._id)}
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
              : 'border-slate-600 hover:border-indigo-400 text-transparent'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Task Title & Description */}
        <div className="flex-1">
          <h3
            className={`text-base font-bold text-slate-100 leading-snug transition-all ${
              isDone ? 'line-through text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {onAiBreakdown && (
            <button
              onClick={() => onAiBreakdown(task)}
              className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
              title="✨ AI Subtask Breakdown"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Edit Task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtasks Progress */}
      {subtasksTotal > 0 && (
        <div className="my-3 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1.5">
            <span>Subtasks ({subtasksCompleted}/{subtasksTotal})</span>
            <span>{Math.round((subtasksCompleted / subtasksTotal) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(subtasksCompleted / subtasksTotal) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Card Footer Badges */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(task.category)}`}>
            🏷️ {task.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getPriorityBadgeClass(task.priority)}`}>
            ⚡ {task.priority}
          </span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center gap-1 font-semibold text-[11px] ${overdue ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
