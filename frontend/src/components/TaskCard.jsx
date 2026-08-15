import React, { useState } from 'react';
import { Check, Trash2, Edit3, Sparkles, Calendar, Clock, Eye, AlertCircle } from 'lucide-react';
import { formatDate, isOverdue, getPriorityBadgeClass, getCategoryBadgeClass, getStatusBadgeClass, extractTags } from '../utils/helpers';
import TaskDetailsModal from './TaskDetailsModal';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onAiBreakdown, onTaskUpdated }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isDone = task.status === 'completed';
  const overdue = isOverdue(task.dueDate, task.status, task.dueTime);
  const effectiveStatus = isDone ? 'completed' : overdue ? 'overdue' : (task.status || 'pending');

  const subtasksTotal = task.subtasks ? task.subtasks.length : 0;
  const subtasksCompleted = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
  const progressPercent = subtasksTotal > 0 ? Math.round((subtasksCompleted / subtasksTotal) * 100) : (isDone ? 100 : 0);

  const tags = extractTags(task);

  return (
    <>
      <div
        className={`group relative bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/10 hover:border-slate-700 flex flex-col justify-between ${
          isDone ? 'opacity-70 bg-slate-900/40' : ''
        }`}
      >
        {/* Priority Indicator Line */}
        <div
          className={`absolute top-0 left-6 right-6 h-1 rounded-b-md ${
            task.priority === 'urgent'
              ? 'bg-red-500 shadow-sm shadow-red-500/50'
              : task.priority === 'high'
              ? 'bg-orange-500'
              : task.priority === 'medium'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
        />

        <div>
          {/* Header Row: Status Badge, Category & Actions */}
          <div className="flex items-center justify-between gap-2 mb-3 mt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadgeClass(effectiveStatus, overdue)}`}>
                {effectiveStatus === 'pending' ? 'Todo' : effectiveStatus === 'in-progress' ? 'In Progress' : effectiveStatus}
              </span>

              {/* Category Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(task.category)}`}>
                🏷️ {task.category}
              </span>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDetailsOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
                title="View Full Task Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              {onAiBreakdown && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAiBreakdown(task); }}
                  className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                  title="✨ AI Subtask Breakdown"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Edit Task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex items-start gap-3 cursor-pointer" onClick={() => setIsDetailsOpen(true)}>
            {/* Completion Toggle Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(task._id); }}
              className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                isDone
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'border-slate-600 hover:border-indigo-400 text-transparent'
              }`}
              title={isDone ? 'Mark as Todo' : 'Mark as Completed'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-bold text-slate-100 leading-snug transition-all ${
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
          </div>

          {/* Subtasks Progress Bar & Count */}
          {subtasksTotal > 0 && (
            <div className="my-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Progress: {progressPercent}%</span>
                <span className="text-indigo-400 font-extrabold">{subtasksCompleted}/{subtasksTotal} completed</span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Hashtag Badges */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap my-2">
              {tags.slice(0, 3).map((tag, tIdx) => (
                <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-indigo-300 border border-slate-700/60 font-medium">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-slate-500 font-bold">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Due Date & Time Info */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80 text-[11px] font-semibold">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getPriorityBadgeClass(task.priority)}`}>
              ⚡ {task.priority}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {task.dueTime && (
              <div className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800 text-[10px] text-purple-300">
                <Clock className="w-3 h-3" />
                <span>{task.dueTime}</span>
              </div>
            )}

            {task.dueDate && (
              <div
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                  overdue
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : formatDate(task.dueDate) === 'Today'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : formatDate(task.dueDate) === 'Tomorrow'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={task}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onAiBreakdown={onAiBreakdown}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  );
};

export default TaskCard;

