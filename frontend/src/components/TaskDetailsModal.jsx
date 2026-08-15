import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, Tag, AlertCircle, Sparkles, Edit3, Trash2, CheckSquare, Plus, Save } from 'lucide-react';
import { formatDate, isOverdue, getPriorityBadgeClass, getCategoryBadgeClass, getStatusBadgeClass, extractTags } from '../utils/helpers';
import * as taskService from '../services/taskService';

import AiSuggestionModal from './AiSuggestionModal';

const TaskDetailsModal = ({ task, isOpen, onClose, onToggleComplete, onEdit, onDelete, onAiBreakdown, onTaskUpdated }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestMode, setSuggestMode] = useState('both');

  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const overdue = isOverdue(task.dueDate, task.status, task.dueTime);
  const effectiveStatus = task.status === 'completed' ? 'completed' : overdue ? 'overdue' : (task.status || 'pending');
  const tags = extractTags(task);

  const subtasksTotal = subtasks ? subtasks.length : 0;
  const subtasksCompleted = subtasks ? subtasks.filter(s => s.completed).length : 0;
  const progressPercent = subtasksTotal > 0 ? Math.round((subtasksCompleted / subtasksTotal) * 100) : (task.status === 'completed' ? 100 : 0);

  const handleOpenSuggest = (mode) => {
    setSuggestMode(mode);
    setIsSuggestModalOpen(true);
  };

  const handleToggleSubtask = async (subId) => {
    const updatedSubtasks = subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    setSubtasks(updatedSubtasks);

    try {
      await taskService.updateTask(task._id, { subtasks: updatedSubtasks });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error updating subtask', err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub = {
      id: 'sub_' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const updatedSubtasks = [...subtasks, newSub];
    setSubtasks(updatedSubtasks);
    setNewSubtaskTitle('');

    try {
      await taskService.updateTask(task._id, { subtasks: updatedSubtasks });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error adding subtask', err);
    }
  };

  const handleDeleteSubtask = async (subId) => {
    const updatedSubtasks = subtasks.filter(s => s.id !== subId);
    setSubtasks(updatedSubtasks);

    try {
      await taskService.updateTask(task._id, { subtasks: updatedSubtasks });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error deleting subtask', err);
    }
  };

  const handleStartEditSubtask = (sub) => {
    setEditingSubtaskId(sub.id);
    setEditingSubtaskTitle(sub.title);
  };

  const handleSaveSubtaskTitle = async (subId) => {
    if (!editingSubtaskTitle.trim()) return;
    const updatedSubtasks = subtasks.map(s => s.id === subId ? { ...s, title: editingSubtaskTitle.trim() } : s);
    setSubtasks(updatedSubtasks);
    setEditingSubtaskId(null);

    try {
      await taskService.updateTask(task._id, { subtasks: updatedSubtasks });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error updating subtask title', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getStatusBadgeClass(effectiveStatus, overdue)}`}>
              {effectiveStatus === 'pending' ? 'Todo' : effectiveStatus === 'in-progress' ? 'In Progress' : effectiveStatus}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getPriorityBadgeClass(task.priority)}`}>
              ⚡ {task.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(task.category)}`}>
                🏷️ {task.category}
              </span>
            </div>
            <h2 className={`text-xl md:text-2xl font-extrabold text-white leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h2>
          </div>

          {/* Description */}
          {task.description && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</h4>
              <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Due Date & Time Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {task.dueDate && (
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Due Date</p>
                  <p className="text-xs font-bold text-white mt-0.5">{formatDate(task.dueDate)}</p>
                </div>
              </div>
            )}

            {task.dueTime && (
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Due Time</p>
                  <p className="text-xs font-bold text-white mt-0.5">{task.dueTime}</p>
                </div>
              </div>
            )}
          </div>

          {/* Subtask Management & Progress Bar */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-200 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Subtasks Progress: {progressPercent}% ({subtasksCompleted}/{subtasksTotal} completed)
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add new subtask step..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subtask</span>
              </button>
            </form>

            {/* Subtasks List */}
            <div className="space-y-2 pt-1">
              {subtasks.map((sub) => (
                <div
                  key={sub.id || sub.title}
                  className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors gap-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                    />

                    {editingSubtaskId === sub.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingSubtaskTitle}
                          onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                          className="flex-1 bg-slate-950 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white outline-none"
                        />
                        <button
                          onClick={() => handleSaveSubtaskTitle(sub.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs text-slate-200 truncate ${sub.completed ? 'line-through text-slate-500' : ''}`}>
                        {sub.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {editingSubtaskId !== sub.id && (
                      <button
                        onClick={() => handleStartEditSubtask(sub)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Edit Subtask"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags List */}
          {tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tags</h4>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-700 text-indigo-300 rounded-lg text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-3 border-t border-slate-800">
            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            {task.completedAt && (
              <span className="text-emerald-400 font-semibold">Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { onClose(); onToggleComplete(task._id); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all ${
                task.status === 'completed'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}</span>
            </button>

            <button
              onClick={() => handleOpenSuggest('priority')}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all"
              title="✨ Suggest Priority"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest Priority</span>
            </button>

            <button
              onClick={() => handleOpenSuggest('deadline')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition-all"
              title="✨ Suggest Deadline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest Deadline</span>
            </button>

            {onAiBreakdown && (
              <button
                onClick={() => { onClose(); onAiBreakdown(task); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Breakdown</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => { onClose(); onEdit(task); }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onClose(); onDelete(task._id); }}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggestion Confirmation Modal */}
      {isSuggestModalOpen && (
        <AiSuggestionModal
          task={task}
          isOpen={isSuggestModalOpen}
          onClose={() => setIsSuggestModalOpen(false)}
          onTaskUpdated={() => {
            if (onTaskUpdated) onTaskUpdated();
          }}
          initialMode={suggestMode}
        />
      )}
    </div>
  );
};

export default TaskDetailsModal;

