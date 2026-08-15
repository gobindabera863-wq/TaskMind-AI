import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskDetailsModal from '../components/TaskDetailsModal';
import EditTaskModal from '../components/EditTaskModal';
import AIChat from '../components/AIChat';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate, isOverdue, getPriorityBadgeClass, getCategoryBadgeClass, getStatusBadgeClass } from '../utils/helpers';

import AiBreakdownModal from '../components/AiBreakdownModal';

const Calendar = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: 'month' | 'week' | 'day'
  const [viewMode, setViewMode] = useState('month');

  // Selected reference date
  const [currentDate, setCurrentDate] = useState(new Date());

  // Quick creation modal / state on date click
  const [createDateStr, setCreateDateStr] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('personal');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickTime, setQuickTime] = useState('12:00');

  // Selected task detail view modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiBreakdownTask, setAiBreakdownTask] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetched = await taskService.getTasks();
      setTasks(fetched);
    } catch (err) {
      console.error('Error loading tasks for calendar view', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Helper to get local YYYY-MM-DD string cleanly without timezone shifts
  const getLocalDateKey = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group tasks by date key YYYY-MM-DD
  const tasksByDate = tasks.reduce((acc, t) => {
    if (t.dueDate) {
      const key = getLocalDateKey(t.dueDate);
      if (key) {
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
      }
    }
    return acc;
  }, {});

  // Date Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Task creation handler for clicked date
  const handleQuickCreateTask = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !createDateStr) return;

    try {
      await taskService.createTask({
        title: quickTitle.trim(),
        dueDate: createDateStr,
        dueTime: quickTime,
        category: quickCategory,
        priority: quickPriority,
        status: 'pending'
      });

      setQuickTitle('');
      setCreateDateStr(null);
      loadTasks();
    } catch (err) {
      console.error('Error creating task from calendar date', err);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      loadTasks();
    } catch (err) {
      console.error('Error toggling complete', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const handleSaveEdit = async (taskId, updatedData) => {
    try {
      await taskService.updateTask(taskId, updatedData);
      setIsEditModalOpen(false);
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      console.error('Error updating task', err);
    }
  };

  // Generate Month Grid Data
  const getMonthGridDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const grid = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      grid.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      grid.push({ date: d, isCurrentMonth: true });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remainingCells = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      grid.push({ date: d, isCurrentMonth: false });
    }

    return grid;
  };

  // Generate Week Grid Data (7 days surrounding currentDate)
  const getWeekDays = () => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay(); // 0 = Sun
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const monthGrid = getMonthGridDates();
  const weekDays = getWeekDays();
  const todayKey = getLocalDateKey(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Sidebar tasks={tasks} />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
            {/* Left: View Mode Switches */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'month' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Month View
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'week' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'day' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Day View
              </button>
            </div>

            {/* Center: Current Month/Date Display */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h2 className="text-base md:text-lg font-extrabold text-white min-w-[160px] text-center">
                {viewMode === 'day'
                  ? currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
                  : monthName}
              </h2>

              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-600/30 transition-all"
              >
                Today
              </button>
            </div>

            {/* Right: Legend Indicator */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Urgent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Low</span>
            </div>
          </div>

          {/* VIEW 1: MONTHLY CALENDAR GRID */}
          {viewMode === 'month' && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-2xl overflow-x-auto">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-800">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-1 md:gap-1.5 mt-2">
                {monthGrid.map((item, idx) => {
                  const dateKey = getLocalDateKey(item.date);
                  const isToday = dateKey === todayKey;
                  const dayTasks = tasksByDate[dateKey] || [];

                  return (
                    <div
                      key={idx}
                      onClick={() => setCreateDateStr(dateKey)}
                      className={`min-h-[100px] md:min-h-[120px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        !item.isCurrentMonth
                          ? 'bg-slate-950/20 border-slate-900/50 opacity-40'
                          : isToday
                          ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-indigo-600 text-white shadow' : 'text-slate-300'
                        }`}>
                          {item.date.getDate()}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 text-slate-400 text-xs font-bold transition-opacity">
                          + Add
                        </span>
                      </div>

                      {/* Day Tasks List */}
                      <div className="space-y-1 my-1 overflow-y-auto max-h-[70px] scrollbar-none">
                        {dayTasks.map((t) => {
                          const overdue = isOverdue(t.dueDate, t.status, t.dueTime);
                          const isDone = t.status === 'completed';
                          return (
                            <div
                              key={t._id}
                              onClick={(e) => { e.stopPropagation(); setSelectedTask(t); }}
                              className={`p-1.5 rounded-lg text-[10px] font-semibold border flex items-center justify-between gap-1 transition-all hover:scale-[1.02] ${
                                isDone
                                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 line-through opacity-70'
                                  : overdue
                                  ? 'bg-red-950/40 border-red-500/40 text-red-300 animate-pulse'
                                  : t.priority === 'urgent'
                                  ? 'bg-red-500/20 border-red-500/30 text-red-300'
                                  : t.priority === 'high'
                                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-300'
                                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                              }`}
                            >
                              <span className="truncate flex-1">{t.title}</span>
                              {t.dueTime && (
                                <span className="text-[9px] opacity-80 shrink-0 font-mono">{t.dueTime}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: WEEKLY CALENDAR VIEW */}
          {viewMode === 'week' && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((dayObj, idx) => {
                  const dateKey = getLocalDateKey(dayObj);
                  const isToday = dateKey === todayKey;
                  const dayTasks = tasksByDate[dateKey] || [];

                  return (
                    <div
                      key={idx}
                      onClick={() => setCreateDateStr(dateKey)}
                      className={`min-h-[300px] p-3 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer ${
                        isToday
                          ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase">
                            {dayObj.toLocaleString('default', { weekday: 'short' })}
                          </p>
                          <p className="text-sm font-extrabold text-white">
                            {dayObj.getDate()} {dayObj.toLocaleString('default', { month: 'short' })}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                          {dayTasks.length}
                        </span>
                      </div>

                      {/* Day Tasks List */}
                      <div className="flex-1 my-2 space-y-2 overflow-y-auto max-h-[350px] pr-1">
                        {dayTasks.length === 0 ? (
                          <p className="text-[11px] text-slate-600 text-center py-6">No tasks due</p>
                        ) : (
                          dayTasks.map((t) => (
                            <div
                              key={t._id}
                              onClick={(e) => { e.stopPropagation(); setSelectedTask(t); }}
                              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 space-y-1 cursor-pointer transition-all"
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className={`capitalize text-[9px] px-1.5 py-0.5 rounded border ${getPriorityBadgeClass(t.priority)}`}>
                                  {t.priority}
                                </span>
                                {t.dueTime && (
                                  <span className="text-[10px] text-purple-300 flex items-center gap-0.5 font-mono">
                                    <Clock className="w-3 h-3" /> {t.dueTime}
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs font-bold text-white truncate ${t.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                {t.title}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); setCreateDateStr(dateKey); }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: DAILY CALENDAR VIEW */}
          {viewMode === 'day' && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tasksByDate[getLocalDateKey(currentDate)]?.length || 0} tasks scheduled for this day
                  </p>
                </div>
                <button
                  onClick={() => setCreateDateStr(getLocalDateKey(currentDate))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Task for Today</span>
                </button>
              </div>

              {/* Day Schedule Task List */}
              <div className="space-y-3">
                {(!tasksByDate[getLocalDateKey(currentDate)] || tasksByDate[getLocalDateKey(currentDate)].length === 0) ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                    <p className="text-sm font-bold text-slate-400">No tasks scheduled for this date.</p>
                    <p className="text-xs text-slate-500 mt-1">Click above to add a new task deadline.</p>
                  </div>
                ) : (
                  tasksByDate[getLocalDateKey(currentDate)].map((t) => (
                    <div
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className="p-4 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${
                          t.priority === 'urgent' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <h4 className={`text-sm font-bold text-white ${t.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                            {t.title}
                          </h4>
                          {t.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {t.dueTime && (
                          <span className="text-xs text-purple-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl font-mono">
                            ⏰ {t.dueTime}
                          </span>
                        )}
                        <span className={`text-xs px-3 py-1 rounded-xl font-bold border capitalize ${getCategoryBadgeClass(t.category)}`}>
                          {t.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Create Task for Selected Date */}
      {createDateStr && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-1">
              📅 Add Task for {formatDate(createDateStr)}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Selected Date: {createDateStr}</p>

            <form onSubmit={handleQuickCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Enter task title..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="finance">Finance</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="urgent">🔴 Urgent</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateDateStr(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Task Details View */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleComplete={handleToggleComplete}
          onEdit={(t) => { setEditingTask(t); setIsEditModalOpen(true); }}
          onDelete={handleDeleteTask}
          onAiBreakdown={(t) => { setSelectedTask(null); setAiBreakdownTask(t); }}
          onTaskUpdated={loadTasks}
        />
      )}

      {/* MODAL 3: Edit Task */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* MODAL 4: AI Assistant */}
      <AIChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      {/* MODAL 5: AI Task Breakdown Modal */}
      {aiBreakdownTask && (
        <AiBreakdownModal
          task={aiBreakdownTask}
          isOpen={!!aiBreakdownTask}
          onClose={() => setAiBreakdownTask(null)}
          onTaskUpdated={loadTasks}
        />
      )}
    </div>
  );
};

export default Calendar;
