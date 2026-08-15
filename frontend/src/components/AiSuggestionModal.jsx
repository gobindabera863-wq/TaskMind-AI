import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, AlertCircle, Calendar, Clock, Loader2, ArrowRight } from 'lucide-react';
import * as aiService from '../services/aiService';
import * as taskService from '../services/taskService';
import { formatDate, getPriorityBadgeClass } from '../utils/helpers';

const AiSuggestionModal = ({ task, isOpen, onClose, onTaskUpdated, initialMode = 'both' }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      fetchSuggestion();
    } else {
      setSuggestion(null);
      setErrorMsg('');
    }
  }, [isOpen, task]);

  const fetchSuggestion = async () => {
    if (!task) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await aiService.suggestTaskPriorityAndDeadline({
        title: task.title,
        description: task.description || '',
        category: task.category || 'personal'
      });
      setSuggestion(data);
    } catch (err) {
      console.warn('Error fetching AI suggestion', err);
      setErrorMsg('AI Service unavailable. Default suggestion loaded.');

      // Heuristic fallback suggestion
      const today = new Date();
      today.setDate(today.getDate() + 3);
      const fallbackDueDate = today.toISOString().split('T')[0];

      setSuggestion({
        priority: 'high',
        suggestedDeadlineDays: 3,
        suggestedDueDate: fallbackDueDate,
        estimatedEffortHours: 4,
        reasoning: `Recommended High priority and 3 days deadline (${fallbackDueDate}) based on task scope.`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  // Handle User Confirmations
  const handleApply = async (applyPriority, applyDeadline) => {
    if (!suggestion) return;

    const updates = {};
    if (applyPriority && suggestion.priority) {
      updates.priority = suggestion.priority;
    }
    if (applyDeadline && suggestion.suggestedDueDate) {
      updates.dueDate = suggestion.suggestedDueDate;
    }

    try {
      await taskService.updateTask(task._id, updates);
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Error applying AI suggestion', err);
      setErrorMsg('Failed to update task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-scaleUp flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                ✨ AI Priority & Deadline Suggestions
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

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs font-bold text-slate-300">AI is evaluating task complexity and deadline schedules...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {suggestion && (
              <>
                {/* AI Reasoning Note */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-indigo-400">🤖 AI Insight: </span>
                  {suggestion.reasoning}
                </div>

                {/* Grid Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Priority Card */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-400">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Priority Recommendation</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">Current:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority || 'medium'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-[11px] font-bold text-indigo-400">Suggested:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border capitalize ${getPriorityBadgeClass(suggestion.priority)}`}>
                        ⚡ {suggestion.priority}
                      </span>
                    </div>
                  </div>

                  {/* Deadline Card */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-400">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Deadline Recommendation</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">Current:</span>
                      <span className="text-[11px] font-bold text-slate-300">
                        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-[11px] font-bold text-indigo-400">Suggested:</span>
                      <span className="text-xs font-extrabold text-indigo-300">
                        {suggestion.suggestedDeadlineDays} days ({suggestion.suggestedDueDate})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Effort Badge */}
                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs">
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Estimated Effort
                  </span>
                  <span className="text-white font-extrabold px-2.5 py-0.5 bg-purple-500/20 rounded-md border border-purple-500/30">
                    {suggestion.estimatedEffortHours} Hours
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Confirmation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Reject / Cancel
          </button>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {initialMode === 'priority' && (
              <button
                type="button"
                disabled={loading || !suggestion}
                onClick={() => handleApply(true, false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50 transition-all"
              >
                Accept Priority ({suggestion?.priority})
              </button>
            )}

            {initialMode === 'deadline' && (
              <button
                type="button"
                disabled={loading || !suggestion}
                onClick={() => handleApply(false, true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50 transition-all"
              >
                Accept Deadline ({suggestion?.suggestedDeadlineDays} days)
              </button>
            )}

            <button
              type="button"
              disabled={loading || !suggestion}
              onClick={() => handleApply(true, true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Accept All Suggestions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionModal;
