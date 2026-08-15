import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import AIChat from '../components/AIChat';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import { BarChart2, TrendingUp, CheckCircle2, Clock, AlertTriangle, Calendar, Flame, Zap, Award, PieChart, Layers } from 'lucide-react';
import { isOverdue, getProductivityLabel } from '../utils/helpers';
import AiWeeklySummaryCard from '../components/AiWeeklySummaryCard';

const Analytics = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedStats] = await Promise.all([
        taskService.getTasks(),
        taskService.getTaskStats()
      ]);
      setTasks(fetchedTasks);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error loading analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // REAL DATA CALCULATIONS (No fake/random numbers)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completedCount = completedTasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;

  const overdueCount = tasks.filter(t => isOverdue(t.dueDate, t.status, t.dueTime) && t.status !== 'completed').length;

  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // 1. Tasks Completed This Week (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = completedTasks.filter(t => {
    const d = new Date(t.completedAt || t.updatedAt || t.createdAt);
    return d >= sevenDaysAgo;
  }).length;

  // 2. Tasks Completed This Month
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const completedThisMonth = completedTasks.filter(t => {
    const d = new Date(t.completedAt || t.updatedAt || t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // 3. Tasks by Category
  const categoriesList = ['work', 'personal', 'health', 'learning', 'finance', 'coding'];
  const tasksByCategory = categoriesList.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category && t.category.toLowerCase().trim() === cat).length;
    return acc;
  }, {});

  // 4. Tasks by Priority
  const prioritiesList = ['urgent', 'high', 'medium', 'low'];
  const tasksByPriority = prioritiesList.reduce((acc, prio) => {
    acc[prio] = tasks.filter(t => t.priority && t.priority.toLowerCase().trim() === prio).length;
    return acc;
  }, {});

  // 5. Most Productive Day of Week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = daysOfWeek.reduce((acc, day) => { acc[day] = 0; return acc; }, {});

  completedTasks.forEach(t => {
    const d = new Date(t.completedAt || t.updatedAt || t.createdAt);
    if (!isNaN(d.getTime())) {
      const dayName = daysOfWeek[d.getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    }
  });

  let mostProductiveDay = 'N/A';
  let maxDayCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostProductiveDay = day;
    }
  });

  // 6. Weekly Velocity Bar Data (Mon - Sun of current week)
  const getWeeklyVelocity = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7; // Mon = 0
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    completedTasks.forEach(t => {
      const d = new Date(t.completedAt || t.updatedAt || t.createdAt);
      if (!isNaN(d.getTime()) && d >= startOfWeek) {
        const dayIdx = (d.getDay() + 6) % 7;
        if (dayIdx >= 0 && dayIdx < 7) {
          counts[dayIdx]++;
        }
      }
    });

    const maxVal = Math.max(...counts, 1);
    return weekDays.map((day, idx) => ({
      day,
      count: counts[idx],
      heightPercent: Math.round((counts[idx] / maxVal) * 100)
    }));
  };

  const weeklyVelocity = getWeeklyVelocity();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <Sidebar tasks={tasks} />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Productivity Analytics</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Real User Data
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time performance metrics, completion velocity, and priority distribution
              </p>
            </div>
          </div>

          {/* AI Weekly Productivity Summary Card */}
          <AiWeeklySummaryCard tasks={tasks} />

          {/* Top 4 Key Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Completed This Week"
              value={completedThisWeek}
              icon="⚡"
              subtext="Last 7 days"
              color="indigo"
            />
            <StatsCard
              title="Completed This Month"
              value={completedThisMonth}
              icon="📅"
              subtext="Current month"
              color="purple"
            />
            <StatsCard
              title="Most Productive Day"
              value={mostProductiveDay}
              icon="🏆"
              subtext={maxDayCount > 0 ? `${maxDayCount} tasks completed` : 'No completions yet'}
              color="cyan"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats.currentStreak || 0} Days`}
              icon="🔥"
              subtext="Consecutive days active"
              color="pink"
            />
          </div>

          {/* Second Row: Productivity Score & Completion Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productivity Gauge Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Productivity Score
                </h3>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {stats.productivityScore || 0} / 100
                </span>
              </div>

              {/* Circular Gauge Meter */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500 transition-all duration-1000"
                      strokeDasharray={`${stats.productivityScore || 0}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-2xl font-black text-white">{stats.productivityScore || 0}/100</span>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 mt-1 rounded-full border ${stats.productivityBadgeColor || 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'}`}>
                      {stats.productivityLabel || getProductivityLabel(stats.productivityScore || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold">Completion Rate</p>
                  <p className="text-sm font-extrabold text-indigo-300 mt-0.5">{completionRate}%</p>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold">Overdue Penalty</p>
                  <p className="text-sm font-extrabold text-red-400 mt-0.5">-{overdueCount * 5} pts</p>
                </div>
              </div>
            </div>

            {/* Weekly Velocity Bar Chart */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Weekly Completion Velocity
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tasks completed per day during the current week</p>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                  {completedThisWeek} Total
                </span>
              </div>

              {/* Bar Chart Container */}
              <div className="flex items-end justify-between gap-3 h-44 pt-6 px-2">
                {weeklyVelocity.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div className="w-full bg-slate-800/80 rounded-t-xl h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-xl transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-400"
                        style={{ height: `${Math.max(item.heightPercent, item.count > 0 ? 15 : 4)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-1">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Third Row: Category & Priority Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Horizontal Bars */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  Tasks by Category
                </h3>
                <span className="text-xs text-slate-400 font-semibold">{totalTasks} Total Tasks</span>
              </div>

              <div className="space-y-3 pt-1">
                {categoriesList.map((cat) => {
                  const count = tasksByCategory[cat] || 0;
                  const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300 capitalize flex items-center gap-1.5">
                          🏷️ {cat}
                        </span>
                        <span className="text-slate-400">{count} tasks ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution Grid */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Priority Distribution
                </h3>
                <span className="text-xs text-slate-400 font-semibold">Active & Pending Tasks</span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-2">
                <div className="p-4 bg-slate-950/70 border border-red-500/30 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-red-400">
                    <span>🔴 Urgent</span>
                    <span>{tasksByPriority.urgent || 0}</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">{tasksByPriority.urgent || 0}</p>
                </div>

                <div className="p-4 bg-slate-950/70 border border-orange-500/30 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-orange-400">
                    <span>🟠 High</span>
                    <span>{tasksByPriority.high || 0}</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">{tasksByPriority.high || 0}</p>
                </div>

                <div className="p-4 bg-slate-950/70 border border-yellow-500/30 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-yellow-400">
                    <span>🟡 Medium</span>
                    <span>{tasksByPriority.medium || 0}</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">{tasksByPriority.medium || 0}</p>
                </div>

                <div className="p-4 bg-slate-950/70 border border-blue-500/30 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>🔵 Low</span>
                    <span>{tasksByPriority.low || 0}</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-2">{tasksByPriority.low || 0}</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-semibold flex items-center justify-between">
                <span>Total Active Pending:</span>
                <span className="font-extrabold text-white">{pendingCount} Tasks</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant Modal */}
      <AIChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />
    </div>
  );
};

export default Analytics;
