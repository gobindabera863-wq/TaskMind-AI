import React, { useState } from 'react';
import { Sparkles, Calendar, Tag, AlertCircle } from 'lucide-react';
import * as aiService from '../services/aiService';

const TaskForm = ({ onTaskAdded }) => {
  const [inputText, setInputText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [nlpPreview, setNlpPreview] = useState(null);

  const handleInputChange = async (e) => {
    const text = e.target.value;
    setInputText(text);

    if (text.length > 5) {
      try {
        const parsed = await aiService.parseTaskNLP(text);
        setNlpPreview(parsed);

        // Auto-fill form controls if AI detects values and user hasn't overridden them
        if (parsed.dueDate) setDueDate(parsed.dueDate);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.priority) setPriority(parsed.priority);
      } catch (err) {}
    } else {
      setNlpPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAiProcessing(true);
    try {
      let finalTaskData;
      if (inputText.length > 5) {
        const parsed = await aiService.parseTaskNLP(inputText);
        finalTaskData = {
          ...parsed,
          title: parsed.title || inputText.trim(),
          dueDate: dueDate || parsed.dueDate || null,
          category: category || parsed.category || 'personal',
          priority: priority || parsed.priority || 'medium'
        };
      } else {
        finalTaskData = {
          title: inputText.trim(),
          dueDate: dueDate || null,
          category,
          priority
        };
      }

      await onTaskAdded(finalTaskData);
      setInputText('');
      setDueDate('');
      setCategory('personal');
      setPriority('medium');
      setNlpPreview(null);
    } catch (err) {
      console.error('Error adding task', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Title Input */}
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type task or natural language: 'Submit report by Friday high priority #work'..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Secondary Controls Bar: Date Picker, Category, Priority & Submit Button */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Due Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer"
              />
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer capitalize"
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
                className="bg-transparent text-slate-200 outline-none cursor-pointer capitalize"
              >
                <option value="urgent" className="bg-slate-900 text-white">🔴 Urgent</option>
                <option value="high" className="bg-slate-900 text-white">🟠 High</option>
                <option value="medium" className="bg-slate-900 text-white">🟡 Medium</option>
                <option value="low" className="bg-slate-900 text-white">🔵 Low</option>
              </select>
            </div>
          </div>

          {/* Add Task Button */}
          <button
            type="submit"
            disabled={isAiProcessing || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all whitespace-nowrap ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiProcessing ? 'Parsing...' : 'Add Task'}</span>
          </button>
        </div>

        {/* Real-time NLP Detection Chips */}
        {nlpPreview && (
          <div className="flex items-center gap-2 flex-wrap pt-2 text-xs border-t border-slate-800/60 animate-fadeIn">
            <span className="text-slate-400 font-medium">✨ AI Auto-Detected:</span>
            {nlpPreview.dueDate && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                📅 Due: {nlpPreview.dueDate}
              </span>
            )}
            {nlpPreview.priority && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold capitalize">
                ⚡ Priority: {nlpPreview.priority}
              </span>
            )}
            {nlpPreview.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold capitalize">
                🏷️ Category: {nlpPreview.category}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;

