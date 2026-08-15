import React, { useState } from 'react';
import { Sparkles, Calendar, Tag, AlertCircle, Clock, Plus, Trash2, Check, Edit3, X } from 'lucide-react';
import * as aiService from '../services/aiService';

const TaskForm = ({ onTaskAdded }) => {
  const [inputText, setInputText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Natural Language Analysis Click / Form Submit
  const handleAnalyzeNaturalLanguage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setErrorMessage('');
    setIsAiAnalyzing(true);

    try {
      const parsed = await aiService.parseTaskNLP(inputText);

      setAiPreviewData({
        title: parsed.title || inputText.trim(),
        description: `Generated from AI input: "${inputText.trim()}"`,
        category: parsed.category || category || 'personal',
        priority: parsed.priority || priority || 'medium',
        dueDate: parsed.dueDate || dueDate || '',
        dueTime: parsed.dueTime || dueTime || '',
        subtasks: Array.isArray(parsed.subtasks)
          ? parsed.subtasks.map((st, i) => ({ id: 'sub_' + Date.now() + '_' + i, title: st, completed: false }))
          : []
      });
    } catch (err) {
      console.warn('AI analysis fallback error:', err);
      setErrorMessage('AI Service unavailable. You can adjust the parameters manually below.');

      // Fallback manual data
      setAiPreviewData({
        title: inputText.trim(),
        description: '',
        category: category || 'personal',
        priority: priority || 'medium',
        dueDate: dueDate || '',
        dueTime: dueTime || '',
        subtasks: []
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Subtask controls inside Preview Modal
  const handleAddPreviewSubtask = (titleStr) => {
    if (!titleStr.trim() || !aiPreviewData) return;
    setAiPreviewData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: 'sub_' + Date.now(), title: titleStr.trim(), completed: false }]
    }));
  };

  const handleDeletePreviewSubtask = (subId) => {
    if (!aiPreviewData) return;
    setAiPreviewData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== subId)
    }));
  };

  // Final submission to database
  const handleConfirmCreateTasks = async () => {
    if (!aiPreviewData || !aiPreviewData.title.trim()) return;

    try {
      await onTaskAdded(aiPreviewData);

      // Reset Form
      setInputText('');
      setDueDate('');
      setDueTime('');
      setCategory('personal');
      setPriority('medium');
      setAiPreviewData(null);
      setErrorMessage('');
    } catch (err) {
      console.error('Error creating task from AI preview', err);
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl transition-all">
      <form onSubmit={handleAnalyzeNaturalLanguage} className="flex flex-col gap-3">
        {/* Title / Natural Language Prompt Bar */}
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Complete my MERN project tomorrow at 7 PM, high priority' or 'Exam next Friday finish DBMS, CN and OS'..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all pr-12"
          />
          <div className="absolute right-3 top-3 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Manual Fallback Controls Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Due Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
              />
            </div>

            {/* Due Time Picker */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
              />
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer capitalize text-xs"
              >
                <option value="work" className="bg-slate-900 text-white">Work</option>
                <option value="personal" className="bg-slate-900 text-white">Personal</option>
                <option value="health" className="bg-slate-900 text-white">Health</option>
                <option value="learning" className="bg-slate-900 text-white">Learning</option>
                <option value="finance" className="bg-slate-900 text-white">Finance</option>
                <option value="coding" className="bg-slate-900 text-white">Coding</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer capitalize text-xs"
              >
                <option value="urgent" className="bg-slate-900 text-white">🔴 Urgent</option>
                <option value="high" className="bg-slate-900 text-white">🟠 High</option>
                <option value="medium" className="bg-slate-900 text-white">🟡 Medium</option>
                <option value="low" className="bg-slate-900 text-white">🔵 Low</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isAiAnalyzing || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all whitespace-nowrap ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiAnalyzing ? 'Analyzing AI Prompt...' : 'Analyze with AI'}</span>
          </button>
        </div>
      </form>

      {/* AI CONFIRMATION PREVIEW MODAL */}
      {aiPreviewData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-xl p-6 shadow-2xl animate-scaleUp space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">AI Confirmation Preview</h3>
                  <p className="text-xs text-slate-400">Verify & edit AI-extracted details before saving</p>
                </div>
              </div>
              <button
                onClick={() => setAiPreviewData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Editable Fields Grid */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Extracted Task Title</label>
                <input
                  type="text"
                  value={aiPreviewData.title}
                  onChange={(e) => setAiPreviewData({ ...aiPreviewData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={aiPreviewData.category}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none capitalize"
                  >
                    <option value="work" className="bg-slate-900">Work</option>
                    <option value="personal" className="bg-slate-900">Personal</option>
                    <option value="health" className="bg-slate-900">Health</option>
                    <option value="learning" className="bg-slate-900">Learning</option>
                    <option value="finance" className="bg-slate-900">Finance</option>
                    <option value="coding" className="bg-slate-900">Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Priority</label>
                  <select
                    value={aiPreviewData.priority}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none capitalize"
                  >
                    <option value="urgent" className="bg-slate-900">🔴 Urgent</option>
                    <option value="high" className="bg-slate-900">🟠 High</option>
                    <option value="medium" className="bg-slate-900">🟡 Medium</option>
                    <option value="low" className="bg-slate-900">🔵 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={aiPreviewData.dueDate || ''}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={aiPreviewData.dueTime || ''}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, dueTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* AI Generated Suggested Subtasks */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Suggested Subtask Steps ({aiPreviewData.subtasks.length})</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {aiPreviewData.subtasks.map((st) => (
                    <div key={st.id} className="flex items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-200 truncate">{st.title}</span>
                      <button
                        onClick={() => handleDeletePreviewSubtask(st.id)}
                        className="p-1 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAiPreviewData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateTasks}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Create Tasks</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;


