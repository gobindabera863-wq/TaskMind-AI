import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import EditTaskModal from '../components/EditTaskModal';
import AIChat from '../components/AIChat';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import AiBreakdownModal from '../components/AiBreakdownModal';
import { getProductivityLabel } from '../utils/helpers';
import AiWeeklySummaryCard from '../components/AiWeeklySummaryCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    highPriority: 0,
    completionRate: 0,
    productivityScore: 0,
    currentStreak: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiBreakdownTask, setAiBreakdownTask] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedStats] = await Promise.all([
        taskService.getTasks(),
        taskService.getTaskStats()
      ]);
      setTasks(fetchedTasks);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      loadDashboardData();
    } catch (err) {
      console.error('Error adding task', err);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      loadDashboardData();
    } catch (err) {
      console.error('Error toggling complete', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      loadDashboardData();
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
      loadDashboardData();
    } catch (err) {
      console.error('Error updating task', err);
    }
  };

  // Comprehensive Filter & Sort Logic
  const filteredTasks = tasks.filter((t) => {
    // 1. Status Filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'overdue') {
        const todayStr = new Date().toISOString().split('T')[0];
        const taskDateStr = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : null;
        const isOverdue = taskDateStr && taskDateStr < todayStr && t.status !== 'completed';
        if (!isOverdue) return false;
      } else {
        if (t.status !== filterStatus) return false;
      }
    }

    // 2. Priority Filter
    if (filterPriority !== 'all') {
      if (!t.priority || t.priority.toLowerCase().trim() !== filterPriority.toLowerCase().trim()) {
        return false;
      }
    }

    // 3. Category Filter
    if (currentCategory !== 'all') {
      if (!t.category) return false;
      if (t.category.toLowerCase().trim() !== currentCategory.toLowerCase().trim()) return false;
    }

    // 4. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      const matchCat = t.category && t.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    return true;
  }).sort((a, b) => {
    // 5. Sorting
    if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOption === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortOption === 'priority') {
      const map = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (map[b.priority] || 0) - (map[a.priority] || 0);
    }
    return 0;
  });

  const handleAddSubtasksFromAi = async (subtasksList, mainTitle) => {
    try {
      for (const subTitle of subtasksList) {
        await taskService.createTask({
          title: subTitle,
          category: 'work',
          priority: 'medium',
          description: `Subtask generated from AI goal: "${mainTitle}"`
        });
      }
      loadDashboardData();
    } catch (err) {
      console.error('Error adding AI subtasks:', err);
    }
  };

  const getProductivityLabel = (score) => {
    if (score >= 85) return '🔥 Peak Productivity';
    if (score >= 65) return '⚡ High Performance';
    if (score >= 40) return '📈 Steady Progress';
    return '🌱 Needs Attention';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          currentCategory={currentCategory}
          onSelectCategory={(cat) => setCurrentCategory(cat)}
          tasks={tasks}
        />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Welcome Banner */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Developer'}! 👋
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time task intelligence & AI productivity hub
              </p>
            </div>
          </div>

          {/* Dynamic 7-Metric Interactive Dashboard Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <StatsCard
              title="Total Tasks"
              value={stats.total}
              icon="📋"
              color="indigo"
              onClick={() => setFilterStatus('all')}
              isActive={filterStatus === 'all'}
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              icon="🎉"
              subtext={`${stats.completionRate}% rate`}
              color="emerald"
              onClick={() => setFilterStatus('completed')}
              isActive={filterStatus === 'completed'}
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon="📌"
              color="amber"
              onClick={() => setFilterStatus('pending')}
              isActive={filterStatus === 'pending'}
            />
            <StatsCard
              title="Overdue"
              value={stats.overdue}
              icon="⚠️"
              color="red"
              onClick={() => setFilterStatus('overdue')}
              isActive={filterStatus === 'overdue'}
            />
            <StatsCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon="📊"
              subtext="Total completed percentage"
              color="purple"
            />
            <StatsCard
              title="Productivity Score"
              value={`${stats.productivityScore || 0}/100`}
              icon="⚡"
              subtext={getProductivityLabel(stats.productivityScore || 0)}
              color="cyan"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats.currentStreak || 0} ${stats.currentStreak === 1 ? 'Day' : 'Days'}`}
              icon="🔥"
              subtext="Consecutive daily activity"
              color="pink"
            />
          </div>

          {/* AI Weekly Productivity Summary Card */}
          <AiWeeklySummaryCard tasks={tasks} />

          {/* Smart Natural Language Task Input */}
          <TaskForm onTaskAdded={handleAddTask} />

          {/* Search, Filter & Control Tools */}
          <div className="flex flex-col gap-3">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <FilterBar
              currentFilter={filterStatus}
              onSelectFilter={setFilterStatus}
              currentPriority={filterPriority}
              onSelectPriority={setFilterPriority}
              currentSort={sortOption}
              onSelectSort={setSortOption}
            />
          </div>

          {/* Task Grid */}
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onAiBreakdown={(task) => setAiBreakdownTask(task)}
            onTaskUpdated={loadDashboardData}
          />
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
        onAddSubtasks={handleAddSubtasksFromAi}
      />

      {/* AI Task Breakdown Confirmation Modal */}
      {aiBreakdownTask && (
        <AiBreakdownModal
          task={aiBreakdownTask}
          isOpen={!!aiBreakdownTask}
          onClose={() => setAiBreakdownTask(null)}
          onTaskUpdated={loadDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;


