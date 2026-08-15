import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, ListChecks, Zap, MessageSquare, Trash2, Copy, Check, PlusCircle } from 'lucide-react';
import * as aiService from '../services/aiService';

const AIChat = ({ isOpen, onClose, onAddSubtasks }) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'breakdown' | 'prioritize'
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "🤖 Hello! I'm your TaskMind AI Productivity Coach.\n\nI have full access to your active tasks, deadlines, and completion progress. Ask me anything or tap one of the quick suggestions below!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Breakdown tab state
  const [breakdownGoal, setBreakdownGoal] = useState('');
  const [breakdownResult, setBreakdownResult] = useState(null);

  // Prioritize tab state
  const [prioritiesResult, setPrioritiesResult] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

  const quickPrompts = [
    "💡 What should I work on today?",
    "⚡ Breakdown my top task",
    "📊 Summarize my productivity stats",
    "🎯 Show urgent priorities"
  ];

  const handleSendChat = async (inputMsg) => {
    const userMsg = typeof inputMsg === 'string' ? inputMsg : chatInput;
    if (!userMsg.trim() || isProcessing) return;

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

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: "🤖 Chat cleared! How can TaskMind AI assist you with your tasks now?"
      }
    ]);
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleGenerateBreakdown = async () => {
    if (!breakdownGoal.trim()) return;
    setIsProcessing(true);
    setAddedSuccess(false);
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

  const handleBatchAddSubtasks = async () => {
    if (!breakdownResult || !breakdownResult.subtasks || !onAddSubtasks) return;
    try {
      await onAddSubtasks(breakdownResult.subtasks, breakdownResult.title);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding subtasks', err);
    }
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Bold text replacements **word** -> <strong>word</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-indigo-300">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={lIdx} className="flex items-start gap-2 my-0.5 pl-1">
            <span className="text-indigo-400 mt-1">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }
      return (
        <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'my-0.5'}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[620px] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">TaskMind AI Assistant</h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OpenAI Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Context-aware personal productivity assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {activeTab === 'chat' && (
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/60 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div>{renderFormattedText(m.text)}</div>

                    {m.sender === 'ai' && (
                      <button
                        onClick={() => handleCopyMessage(m.text, idx)}
                        title="Copy message"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-indigo-400 flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>TaskMind AI is formulating a response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
              {quickPrompts.map((promptText, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendChat(promptText)}
                  disabled={isProcessing}
                  className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-indigo-300 transition-all shadow-sm hover:scale-[1.02] disabled:opacity-50"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI: 'What should I work on today?'..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isProcessing || !chatInput.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Task Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter a main goal or project title:
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
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all"
                >
                  {isProcessing ? 'Generating...' : 'Break Down'}
                </button>
              </div>
            </div>

            {breakdownResult && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    AI Action Plan for "{breakdownResult.title}":
                  </h4>
                  {onAddSubtasks && (
                    <button
                      onClick={handleBatchAddSubtasks}
                      disabled={addedSuccess}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-all disabled:opacity-75"
                    >
                      {addedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Tasks!</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Add All to My Tasks</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <ul className="space-y-2">
                  {breakdownResult.subtasks.map((sub, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-200 bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{sub}</span>
                      </div>
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
            <div className="flex justify-between items-center bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-white">Smart Task Priority Queue</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  AI evaluates all your active tasks, urgency, and deadlines to order your workload.
                </p>
              </div>
              <button
                onClick={handleGetPriorities}
                disabled={isProcessing}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all shrink-0"
              >
                {isProcessing ? 'Analyzing...' : 'Analyze Workload'}
              </button>
            </div>

            {prioritiesResult && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Strategic Insight: </span>
                    {prioritiesResult.reasoning}
                  </div>
                </div>

                <div className="space-y-2">
                  {prioritiesResult.recommendations.map((rec) => (
                    <div
                      key={rec.rank}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                            #{rec.rank}
                          </span>
                          {rec.title}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          rec.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7">{rec.reasoning}</p>
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

