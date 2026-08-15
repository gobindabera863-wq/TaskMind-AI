import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Trash2, Edit3, Plus, Save, AlertCircle, Loader2 } from 'lucide-react';
import * as aiService from '../services/aiService';
import * as taskService from '../services/taskService';

const AiBreakdownModal = ({ task, isOpen, onClose, onTaskUpdated }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      fetchAiBreakdown();
    } else {
      setSubtasks([]);
      setErrorMsg('');
    }
  }, [isOpen, task]);

  const fetchAiBreakdown = async () => {
    if (!task) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await aiService.getTaskBreakdown(task.title);
      const generatedList = res.subtasks || [];

      const formatted = generatedList.map((stepStr, idx) => ({
        id: 'sub_' + Date.now() + '_' + idx,
        title: stepStr,
        completed: false
      }));

      setSubtasks(formatted);
    } catch (err) {
      console.warn('Error fetching AI breakdown', err);
      setErrorMsg('AI Service encountered an issue. Standard project breakdown steps have been loaded.');
      
      // Fallback steps
      const fallbackSteps = [
        `Setup requirements for "${task.title}"`,
        `Define architecture & core step breakdown`,
        `Execute primary implementation phase`,
        `Review output & perform quality testing`,
        `Finalize delivery and mark task completed`
      ];

      setSubtasks(fallbackSteps.map((stepStr, idx) => ({
        id: 'sub_' + Date.now() + '_' + idx,
        title: stepStr,
        completed: false
      })));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  // Subtask management in preview modal
  const handleAddStep = (e) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    setSubtasks([
      ...subtasks,
      { id: 'sub_' + Date.now(), title: newStepTitle.trim(), completed: false }
    ]);
    setNewStepTitle('');
  };

  const handleDeleteStep = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleStartEdit = (step) => {
    setEditingId(step.id);
    setEditingTitle(step.title);
  };

  const handleSaveEdit = (id) => {
    if (!editingTitle.trim()) return;
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, title: editingTitle.trim() } : s))
    );
    setEditingId(null);
  };

  // Confirm and Save subtasks to Database
  const handleConfirmSave = async () => {
    try {
      // Append or replace existing subtasks
      const existingSubtasks = task.subtasks || [];
      const mergedSubtasks = [...existingSubtasks, ...subtasks];

      await taskService.updateTask(task._id, { subtasks: mergedSubtasks });

      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Error saving subtasks to task', err);
      setErrorMsg('Failed to save subtasks to database.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-xl p-6 shadow-2xl animate-scaleUp flex flex-col space-y-5 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>✨ AI Break Down Task</span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
                Task: <strong className="text-slate-200">"{task.title}"</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading Spinner State */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-xs font-bold text-slate-300">AI is analyzing goal & generating step-by-step subtasks...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {errorMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generated Subtasks Confirmation List */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Subtask Steps ({subtasks.length}):
              </p>

              {subtasks.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                  No subtasks remaining. Click below to add steps manually.
                </div>
              ) : (
                subtasks.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all gap-2"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {editingId === step.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1 bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white outline-none font-medium"
                          />
                          <button
                            onClick={() => handleSaveEdit(step.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {step.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {editingId !== step.id && (
                        <button
                          onClick={() => handleStartEdit(step)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Edit Subtask"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove Subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Subtask Input */}
            <form onSubmit={handleAddStep} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                placeholder="Add extra custom step..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                disabled={!newStepTitle.trim()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || subtasks.length === 0}
            onClick={handleConfirmSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Accept & Save Subtasks</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiBreakdownModal;
