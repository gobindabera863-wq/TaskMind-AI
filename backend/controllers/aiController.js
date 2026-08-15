const { parseTaskNaturalLanguage, generateTaskBreakdown, suggestTaskPriorityAndDeadline, prioritizeUserTasks, processAIChat } = require('../services/aiService');
const Task = require('../models/Task');
const { getIsInMemoryFallback } = require('../config/db');
const { memoryTasks } = require('./taskController');

// @desc    Parse natural language input into structured task object
// @route   POST /api/ai/parse-task
// @access  Private
const parseTaskNLP = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  const structuredTask = await parseTaskNaturalLanguage(prompt);
  res.json(structuredTask);
};

// @desc    Generate AI task breakdown
// @route   POST /api/ai/breakdown
// @access  Private
const taskBreakdown = async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Task title is required' });

  const subtasks = await generateTaskBreakdown(title);
  res.json({ title, subtasks });
};

// @desc    Suggest Priority and Deadline for task
// @route   POST /api/ai/suggest
// @access  Private
const suggestTask = async (req, res) => {
  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ message: 'Task title is required' });

  const suggestion = await suggestTaskPriorityAndDeadline(title, description, category);
  res.json(suggestion);
};

// @desc    Prioritize user tasks using AI
// @route   POST /api/ai/prioritize
// @access  Private
const prioritizeTasks = async (req, res) => {
  const userId = req.user._id.toString();
  let userTasks;

  if (getIsInMemoryFallback()) {
    userTasks = memoryTasks.filter(t => t.user.toString() === userId);
  } else {
    userTasks = await Task.find({ user: req.user._id });
  }

  const result = await prioritizeUserTasks(userTasks);
  res.json(result);
};

// @desc    AI Productivity Chatbot handler
// @route   POST /api/ai/chat
// @access  Private
const aiChat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const userId = req.user._id.toString();
  let userTasks;

  if (getIsInMemoryFallback()) {
    userTasks = memoryTasks.filter(t => t.user.toString() === userId);
  } else {
    userTasks = await Task.find({ user: req.user._id });
  }

  const responseText = await processAIChat(message, userTasks, req.user.name);
  res.json({ reply: responseText });
};

module.exports = {
  parseTaskNLP,
  taskBreakdown,
  suggestTask,
  prioritizeTasks,
  aiChat
};
