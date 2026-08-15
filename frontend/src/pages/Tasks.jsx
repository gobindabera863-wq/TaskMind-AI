import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import TaskCard from '../components/TaskCard';
import EditTaskModal from '../components/EditTaskModal';
import AIChat from '../components/AIChat';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import { Sparkles, ArrowUpDown, Filter, AlertCircle, Calendar, Plus, CheckCircle2, Clock, MoveRight } from 'lucide-react';
import { isOverdue } from '../utils/helpers';

import AiBreakdownModal from '../components/AiBreakdownModal';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDueDate, setFilterDueDate] = useState('all');

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropCol, setActiveDropCol] = useState(null);

  // Mobile active tab state for columns
  const [mobileActiveCol, setMobileActiveCol] = useState('all');

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiBreakdownTask, setAiBreakdownTask] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks for Kanban board', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      loadTasks();
    } catch (err) {
      console.error('Error adding task', err);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      loadTasks();
    } catch (err) {
      console.error('Error toggling task complete', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      loadTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (taskId, updatedData) => {
    try {
      await taskService.updateTask(taskId, updatedData);
      setIsEditModalOpen(false);
      loadTasks();
    } catch (err) {
      console.error('Error updating task', err);
    }
  };

  // Drag and Drop move handler with optimistic UI and immediate DB persistence
  const handleMoveTask = async (taskId, targetStatus) => {
    if (!taskId) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId
          ? {
              ...t,
              status: targetStatus,
              completedAt: targetStatus === 'completed' ? new Date().toISOString() : null
            }
          : t
      )
    );

    try {
      await taskService.updateTask(taskId, {
        status: targetStatus,
        completedAt: targetStatus === 'completed' ? new Date().toISOString() : null
      });
      loadTasks();
    } catch (err) {
      console.error('Error updating task status on drag drop', err);
      loadTasks();
    }
  };

  // Filter Tasks Logic
  const filteredTasks = tasks.filter((t) => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      const matchCat = t.category && t.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // 2. Category Filter
    if (currentCategory !== 'all') {
      if (!t.category || t.category.toLowerCase().trim() !== currentCategory.toLowerCase().trim()) {
        return false;
      }
    }

    // 3. Priority Filter
    if (filterPriority !== 'all') {
      if (!t.priority || t.priority.toLowerCase().trim() !== filterPriority.toLowerCase().trim()) {
        return false;
      }
    }

    // 4. Status Filter
    if (filterStatus !== 'all') {
      const overdue = isOverdue(t.dueDate, t.status, t.dueTime);
      if (filterStatus === 'overdue') {
        if (!overdue) return false;
      } else {
        if (t.status !== filterStatus) return false;
      }
    }

    // 5. Due Date Filter
    if (filterDueDate !== 'all') {
      if (!t.dueDate) return false;
      const todayStr = new Date().toISOString().split('T')[0];
      const dueStr = new Date(t.dueDate).toISOString().split('T')[0];

      if (filterDueDate === 'today' && dueStr !== todayStr) return false;

      if (filterDueDate === 'this-week') {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const dueObj = new Date(dueStr);
        if (dueObj < today || dueObj > nextWeek) return false;
      }

      if (filterDueDate === 'overdue') {
        const overdue = isOverdue(t.dueDate, t.status, t.dueTime);
        if (!overdue) return false;
      }
    }

    return true;
  });

  // Categorize tasks into 3 Kanban columns
  const todoTasks = filteredTasks.filter((t) => {
    const overdue = isOverdue(t.dueDate, t.status, t.dueTime);
    return (t.status === 'pending' || !t.status) && !overdue;
  });

  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in-progress');

  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const overdueTasks = filteredTasks.filter((t) => {
    return isOverdue(t.dueDate, t.status, t.dueTime) && t.status !== 'completed';
  });

  const columns = [
    {
      id: 'pending',
      title: 'TODO',
      icon: '📌',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      tasks: [...todoTasks, ...overdueTasks]
    },
    {
      id: 'in-progress',
      title: 'IN PROGRESS',
      icon: '⚡',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      tasks: inProgressTasks
    },
    {
      id: 'completed',
      title: 'COMPLETED',
      icon: '🎉',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tasks: completedTasks
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <Sidebar
          currentCategory={currentCategory}
          onSelectCategory={(cat) => setCurrentCategory(cat)}
          tasks={tasks}
        />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Kanban Tasks Workspace</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {filteredTasks.length} Active Tasks
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Drag and drop tasks between columns to update progress instantly
              </p>
            </div>
          </div>

          {/* Quick Task Addition Bar */}
          <TaskForm onTaskAdded={handleAddTask} />

          {/* Comprehensive Filters Bar */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {/* Priority Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-1.5 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-400">Priority:</span>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-transparent text-white outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">All</option>
                    <option value="urgent" className="bg-slate-900">🔴 Urgent</option>
                    <option value="high" className="bg-slate-900">🟠 High</option>
                    <option value="medium" className="bg-slate-900">🟡 Medium</option>
                    <option value="low" className="bg-slate-900">🔵 Low</option>
                  </select>
                </div>

                {/* Due Date Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-3 py-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-400">Due:</span>
                  <select
                    value={filterDueDate}
                    onChange={(e) => setFilterDueDate(e.target.value)}
                    className="bg-transparent text-white outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">All Dates</option>
                    <option value="today" className="bg-slate-900">Today</option>
                    <option value="this-week" className="bg-slate-900">This Week</option>
                    <option value="overdue" className="bg-slate-900">Overdue ⚠️</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(searchQuery || currentCategory !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterDueDate !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentCategory('all');
                      setFilterPriority('all');
                      setFilterStatus('all');
                      setFilterDueDate('all');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Column Tabs Switcher */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setMobileActiveCol('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border ${
                mobileActiveCol === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              All Columns
            </button>
            {columns.map((col) => (
              <button
                key={col.id}
                onClick={() => setMobileActiveCol(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 ${
                  mobileActiveCol === col.id
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <span>{col.icon}</span>
                <span>{col.title} ({col.tasks.length})</span>
              </button>
            ))}
          </div>

          {/* Kanban Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {columns.map((col) => {
              if (mobileActiveCol !== 'all' && mobileActiveCol !== col.id) {
                return null;
              }

              const isTargetActive = activeDropCol === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (activeDropCol !== col.id) setActiveDropCol(col.id);
                  }}
                  onDragLeave={() => setActiveDropCol(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setActiveDropCol(null);
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                      handleMoveTask(taskId, col.id);
                    }
                  }}
                  className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-4 min-h-[500px] flex flex-col shadow-xl transition-all ${
                    isTargetActive
                      ? 'border-indigo-500/80 bg-indigo-950/20 ring-2 ring-indigo-500/40'
                      : 'border-slate-800/90'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{col.icon}</span>
                      <h3 className="text-sm font-extrabold tracking-wide text-white">{col.title}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.badgeClass}`}>
                      {col.tasks.length}
                    </span>
                  </div>

                  {/* Tasks List Drop Target Container */}
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                    {col.tasks.length === 0 ? (
                      <div className="h-40 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs text-slate-500 font-semibold">No tasks in {col.title}</p>
                        <p className="text-[11px] text-slate-600 mt-1">Drag task card here to move</p>
                      </div>
                    ) : (
                      col.tasks.map((t) => (
                        <div
                          key={t._id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedTaskId(t._id);
                            e.dataTransfer.setData('text/plain', t._id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => setDraggedTaskId(null)}
                          className={`cursor-grab active:cursor-grabbing transition-all ${
                            draggedTaskId === t._id ? 'opacity-40 scale-95' : ''
                          }`}
                        >
                          <TaskCard
                            task={t}
                            onToggleComplete={handleToggleComplete}
                            onEdit={handleOpenEdit}
                            onDelete={handleDeleteTask}
                            onAiBreakdown={(task) => setAiBreakdownTask(task)}
                            onTaskUpdated={loadTasks}
                          />

                          {/* Quick Move Selector for Touch/Mobile */}
                          <div className="mt-1 flex items-center justify-end gap-1 px-2">
                            <span className="text-[10px] text-slate-500">Move to:</span>
                            {columns.filter(c => c.id !== col.id).map(targetCol => (
                              <button
                                key={targetCol.id}
                                onClick={() => handleMoveTask(t._id, targetCol.id)}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 hover:bg-slate-800 transition-colors"
                              >
                                {targetCol.icon} {targetCol.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* AI Assistant Modal */}
      <AIChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      {/* AI Task Breakdown Confirmation Modal */}
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

export default Tasks;
