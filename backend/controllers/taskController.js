const Task = require('../models/Task');
const { getIsInMemoryFallback } = require('../config/db');

// In-memory Task store fallback
const memoryTasks = [
  {
    _id: 'task_sample_1',
    user: 'user_demo_123',
    title: 'Complete MERN AI To-Do Application',
    description: 'Implement Express API, React Vite frontend, Auth Context, and AI Assistant.',
    category: 'coding',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    dueTime: '18:00',
    subtasks: [
      { id: 'sub_1', title: 'Set up Express server routes', completed: true },
      { id: 'sub_2', title: 'Build React components & Auth Context', completed: true },
      { id: 'sub_3', title: 'Connect AI service endpoints', completed: false }
    ],
    estimatedTime: 45,
    timeSpent: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'task_sample_2',
    user: 'user_demo_123',
    title: 'Workout & Hydration #health',
    description: 'Morning 30-min cardio session and core exercises.',
    category: 'health',
    priority: 'medium',
    status: 'completed',
    dueDate: new Date().toISOString(),
    dueTime: '08:00',
    subtasks: [],
    estimatedTime: 30,
    timeSpent: 30,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// @desc    Get all user tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  const userId = req.user._id.toString();

  if (getIsInMemoryFallback()) {
    let userTasks = memoryTasks.filter(t => t.user.toString() === userId);
    
    // Apply optional filter parameters
    const { status, category, priority, search } = req.query;
    if (status) userTasks = userTasks.filter(t => t.status === status);
    if (category && category !== 'all') {
      userTasks = userTasks.filter(
        t => t.category && t.category.toLowerCase().trim() === category.toLowerCase().trim()
      );
    }
    if (priority && priority !== 'all') {
      userTasks = userTasks.filter(
        t => t.priority && t.priority.toLowerCase().trim() === priority.toLowerCase().trim()
      );
    }
    if (search) {
      const q = search.toLowerCase();
      userTasks = userTasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return res.json(userTasks);
  }

  // MongoDB Query
  const query = { user: req.user._id };
  const { status, category, priority, search } = req.query;

  if (status) query.status = status;
  if (category && category !== 'all') {
    query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
  }
  if (priority && priority !== 'all') {
    query.priority = { $regex: new RegExp(`^${priority.trim()}$`, 'i') };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });
  res.json(tasks);
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  const userId = req.user._id.toString();

  if (getIsInMemoryFallback()) {
    const task = memoryTasks.find(t => t._id === req.params.id && t.user.toString() === userId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.json(task);
  }

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to access this task' });
  }

  res.json(task);
};

// @desc    Create new task
// @route   POST /api/tasks
// Recurrence Date Calculation Helper
const calculateNextDueDate = (currentDueDate, repeatFrequency, repeatDays = []) => {
  const date = currentDueDate ? new Date(currentDueDate) : new Date();
  if (isNaN(date.getTime())) return new Date();

  const nextDate = new Date(date);

  if (repeatFrequency === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (repeatFrequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (repeatFrequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (repeatFrequency === 'custom' && repeatDays && repeatDays.length > 0) {
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const targetDayNums = repeatDays.map(d => dayMap[String(d).toLowerCase()]).filter(d => d !== undefined);

    if (targetDayNums.length > 0) {
      let found = false;
      for (let i = 1; i <= 7; i++) {
        const check = new Date(date);
        check.setDate(date.getDate() + i);
        if (targetDayNums.includes(check.getDay())) {
          nextDate.setTime(check.getTime());
          found = true;
          break;
        }
      }
      if (!found) nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setDate(nextDate.getDate() + 7);
    }
  } else {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, category, priority, status, tags, dueDate, dueTime, subtasks, estimatedTime, isRecurring, repeatFrequency, repeatDays, reminder, reminderCustomMinutes } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Please add a task title' });
  }

  const userId = req.user._id.toString();

  if (getIsInMemoryFallback()) {
    const newTask = {
      _id: 'task_' + Date.now(),
      user: userId,
      title,
      description: description || '',
      category: category || 'personal',
      priority: priority || 'medium',
      status: status || 'pending',
      tags: tags || [],
      dueDate: dueDate || null,
      dueTime: dueTime || '',
      subtasks: subtasks || [],
      estimatedTime: estimatedTime || 25,
      timeSpent: 0,
      isRecurring: isRecurring || false,
      repeatFrequency: repeatFrequency || 'none',
      repeatDays: repeatDays || [],
      reminder: reminder || 'none',
      reminderCustomMinutes: reminderCustomMinutes || 0,
      reminderNotified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryTasks.unshift(newTask);
    return res.status(201).json(newTask);
  }

  const task = await Task.create({
    user: req.user._id,
    title,
    description: description || '',
    category: category || 'personal',
    priority: priority || 'medium',
    status: status || 'pending',
    tags: tags || [],
    dueDate: dueDate || null,
    dueTime: dueTime || '',
    subtasks: subtasks || [],
    estimatedTime: estimatedTime || 25,
    isRecurring: isRecurring || false,
    repeatFrequency: repeatFrequency || 'none',
    repeatDays: repeatDays || [],
    reminder: reminder || 'none',
    reminderCustomMinutes: reminderCustomMinutes || 0,
    reminderNotified: false
  });

  res.status(201).json(task);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const userId = req.user._id.toString();

  if (getIsInMemoryFallback()) {
    const index = memoryTasks.findIndex(t => t._id === req.params.id && t.user.toString() === userId);
    if (index === -1) return res.status(404).json({ message: 'Task not found' });

    const existing = memoryTasks[index];
    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date()
    };
    if (req.body.status === 'completed' && existing.status !== 'completed') {
      updated.completedAt = new Date();
    }
    memoryTasks[index] = updated;
    return res.json(updated);
  }

  let task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  if (req.body.status === 'completed' && task.status !== 'completed') {
    req.body.completedAt = new Date();
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(task);
};

// @desc    Toggle complete task
// @route   PATCH /api/tasks/:id/complete
// @access  Private
const toggleTaskComplete = async (req, res) => {
  const userId = req.user._id.toString();

  if (getIsInMemoryFallback()) {
    const task = memoryTasks.find(t => t._id === req.params.id && t.user.toString() === userId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isCompleting = task.status !== 'completed';
    task.status = isCompleting ? 'completed' : 'pending';
    task.completedAt = isCompleting ? new Date() : null;
    task.updatedAt = new Date();

    // Automatic Recurring Task Spawning
    if (isCompleting && (task.isRecurring || (task.repeatFrequency && task.repeatFrequency !== 'none'))) {
      const nextDueDate = calculateNextDueDate(task.dueDate, task.repeatFrequency, task.repeatDays);
      const nextTask = {
        _id: 'task_' + Date.now(),
        user: userId,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: 'pending',
        tags: task.tags || [],
        dueDate: nextDueDate,
        dueTime: task.dueTime,
        subtasks: (task.subtasks || []).map(s => ({ ...s, completed: false })),
        estimatedTime: task.estimatedTime,
        timeSpent: 0,
        isRecurring: task.isRecurring,
        repeatFrequency: task.repeatFrequency,
        repeatDays: task.repeatDays,
        reminder: task.reminder,
        reminderCustomMinutes: task.reminderCustomMinutes,
        reminderNotified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryTasks.unshift(nextTask);
    }

    return res.json(task);
  }

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const isCompleting = task.status !== 'completed';
  task.status = isCompleting ? 'completed' : 'pending';
  task.completedAt = isCompleting ? new Date() : null;
  await task.save();

  // Automatic Recurring Task Spawning in DB
  if (isCompleting && (task.isRecurring || (task.repeatFrequency && task.repeatFrequency !== 'none'))) {
    const nextDueDate = calculateNextDueDate(task.dueDate, task.repeatFrequency, task.repeatDays);
    await Task.create({
      user: req.user._id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: 'pending',
      tags: task.tags || [],
      dueDate: nextDueDate,
      dueTime: task.dueTime,
      subtasks: (task.subtasks || []).map(s => ({ ...s, completed: false })),
      estimatedTime: task.estimatedTime,
      isRecurring: task.isRecurring,
      repeatFrequency: task.repeatFrequency,
      repeatDays: task.repeatDays,
      reminder: task.reminder,
      reminderCustomMinutes: task.reminderCustomMinutes,
      reminderNotified: false
    });
  }

  res.json(task);
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const userId = req.user._id.toString();

  if (getIsInMemoryFallback()) {
    const index = memoryTasks.findIndex(t => t._id === req.params.id && t.user.toString() === userId);
    if (index === -1) return res.status(404).json({ message: 'Task not found' });

    memoryTasks.splice(index, 1);
    return res.json({ message: 'Task removed successfully' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await task.deleteOne();
  res.json({ message: 'Task removed successfully' });
};

const { calculateProductivityScore } = require('../services/productivityService');

// @desc    Get dashboard statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  const userId = req.user._id.toString();

  let userTasks;
  if (getIsInMemoryFallback()) {
    userTasks = memoryTasks.filter(t => t.user.toString() === userId);
  } else {
    userTasks = await Task.find({ user: req.user._id });
  }

  const total = userTasks.length;
  const completed = userTasks.filter(t => t.status === 'completed').length;
  const pending = userTasks.filter(t => t.status === 'pending').length;
  const inProgress = userTasks.filter(t => t.status === 'in-progress').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = userTasks.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    try {
      const d = new Date(t.dueDate);
      if (isNaN(d.getTime())) return false;
      return d.toISOString().split('T')[0] < todayStr;
    } catch (e) {
      return false;
    }
  }).length;

  const highPriority = userTasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'completed').length;

  // Dynamic Completion Rate %
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Deterministic Productivity Score Service
  const productivityData = calculateProductivityScore(userTasks);

  res.json({
    total,
    completed,
    pending,
    inProgress,
    overdue,
    highPriority,
    completionRate,
    productivityScore: productivityData.score,
    productivityLabel: productivityData.label,
    productivityBadgeColor: productivityData.badgeColor,
    currentStreak: productivityData.currentStreak,
    breakdown: productivityData.breakdown
  });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  getTaskStats,
  memoryTasks
};
