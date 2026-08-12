import React, { useState } from 'react';
import { X, Sparkles, Send, ListChecks, Zap, MessageSquare } from 'lucide-react';
import * as aiService from '../services/aiService';

const AIChat = ({ isOpen, onClose, onAddSubtasks }) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'breakdown' | 'prioritize'
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '🤖 Hello! I am your TaskMind AI Productivity Assistant. Ask me "What should I work on today?", "How many tasks have I completed?", or "Break down my biggest task" for guidance!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Breakdown tab state
  const [breakdownGoal, setBreakdownGoal] = useState('');
  const [breakdownResult, setBreakdownResult] = useState(null);

  // Prioritize tab state
  const [prioritiesResult, setPrioritiesResult] = useState(null);

  if (!isOpen) return null;

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userMsg = chatInput;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsProcessing(true);

    try {
      const res = await aiService.sendAIChat(userMsg);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Unable to connect to AI Service. Please check backend server.' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBreakdown = async () => {
    if (!breakdownGoal.trim()) return;
    setIsProcessing(true);
    try {
      const res = await aiService.getTaskBreakdown(breakdownGoal);
      setBreakdownResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetPriorities = async () => {
    setIsProcessing(true);
    try {
      const res = await aiService.getTaskPrioritization();
      setPrioritiesResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">TaskMind AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/60 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Chatbot</span>
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'breakdown'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Task Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('prioritize')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'prioritize'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI Prioritization</span>
          </button>
        </div>

        {/* Tab 1: AI Chatbot */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-indigo-400 animate-pulse">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI: 'What should I work on today?'..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              />
              <button
                type="submit"
                disabled={isProcessing || !chatInput.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Task Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Enter a large project or goal title:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={breakdownGoal}
                  onChange={(e) => setBreakdownGoal(e.target.value)}
                  placeholder="e.g. 'Build an e-commerce website' or 'Plan 3-day Paris trip'"
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
                <button
                  onClick={handleGenerateBreakdown}
                  disabled={isProcessing || !breakdownGoal.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
            </div>

            {breakdownResult && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-indigo-300">
                  ✨ Generated Subtasks for "{breakdownResult.title}":
                </h4>
                <ul className="space-y-2">
                  {breakdownResult.subtasks.map((sub, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-300 bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between"
                    >
                      <span>
                        {idx + 1}. {sub}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: AI Prioritization */}
        {activeTab === 'prioritize' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                AI analyzes all your pending tasks and deadlines to generate an optimized priority queue.
              </p>
              <button
                onClick={handleGetPriorities}
                disabled={isProcessing}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                Analyze Tasks
              </button>
            </div>

            {prioritiesResult && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl">
                  💡 {prioritiesResult.reasoning}
                </div>

                <div className="space-y-2">
                  {prioritiesResult.recommendations.map((rec) => (
                    <div
                      key={rec.rank}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>
                          #{rec.rank} {rec.title}
                        </span>
                        <span className="text-amber-400 uppercase">{rec.priority}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
