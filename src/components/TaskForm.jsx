import React, { useState } from 'react';
import { Sparkles, Plus, Mic } from 'lucide-react';
import * as aiService from '../services/aiService';

const TaskForm = ({ onTaskAdded }) => {
  const [inputText, setInputText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [nlpPreview, setNlpPreview] = useState(null);

  const handleInputChange = async (e) => {
    const text = e.target.value;
    setInputText(text);

    if (text.length > 5) {
      try {
        const parsed = await aiService.parseTaskNLP(text);
        setNlpPreview(parsed);
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
      const parsed = await aiService.parseTaskNLP(inputText);
      await onTaskAdded(parsed);
      setInputText('');
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
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type naturally: 'Finish MERN project by Friday priority high #coding'..."
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isAiProcessing || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiProcessing ? 'Parsing...' : 'Add Task'}</span>
          </button>
        </div>

        {/* Real-time NLP Detection Chips */}
        {nlpPreview && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs animate-fadeIn">
            <span className="text-slate-400 font-medium">AI Detected:</span>
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
                🏷️ Tag: {nlpPreview.category}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
