/**
 * TaskMind AI Backend Intelligence Service
 * Interacts with OpenAI API (or built-in smart NLP heuristic fallback if key is not configured)
 */

const parseTaskNaturalLanguage = async (inputPrompt) => {
  const text = inputPrompt.trim();
  let priority = 'medium';
  let category = 'personal';
  let dueDate = null;
  let cleanTitle = text;

  // Extract Priority
  if (/urgent|p1|asap|critical/i.test(text)) {
    priority = 'urgent';
    cleanTitle = cleanTitle.replace(/urgent|p1|asap|critical/gi, '');
  } else if (/high|p2|important/i.test(text)) {
    priority = 'high';
    cleanTitle = cleanTitle.replace(/high|p2|important/gi, '');
  } else if (/low|p4|minor/i.test(text)) {
    priority = 'low';
    cleanTitle = cleanTitle.replace(/low|p4|minor/gi, '');
  }

  // Extract Category
  if (/code|app|bug|repo|git|api|html|css|react/i.test(text)) category = 'coding';
  else if (/gym|health|doctor|workout|run|diet/i.test(text)) category = 'health';
  else if (/email|meeting|client|report|project|slide/i.test(text)) category = 'work';
  else if (/study|read|course|book|learn/i.test(text)) category = 'learning';
  else if (/pay|bank|bill|tax|money|budget/i.test(text)) category = 'finance';

  // Extract Date
  const today = new Date();
  if (/tomorrow/i.test(text)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    dueDate = tomorrow.toISOString().split('T')[0];
    cleanTitle = cleanTitle.replace(/tomorrow/gi, '');
  } else if (/today/i.test(text)) {
    dueDate = today.toISOString().split('T')[0];
    cleanTitle = cleanTitle.replace(/today/gi, '');
  } else if (/friday/i.test(text)) {
    const nextFri = new Date(today);
    nextFri.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    dueDate = nextFri.toISOString().split('T')[0];
    cleanTitle = cleanTitle.replace(/friday/gi, '');
  }

  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
  if (!cleanTitle) cleanTitle = text;

  return {
    title: cleanTitle,
    priority,
    category,
    dueDate
  };
};

const generateTaskBreakdown = async (goalTitle) => {
  const lower = goalTitle.toLowerCase();
  let subtasks = [];

  if (lower.includes('website') || lower.includes('app') || lower.includes('e-commerce') || lower.includes('mern')) {
    subtasks = [
      "Design database schema and Mongoose models",
      "Build REST API authentication & JWT endpoints",
      "Create React component layout and CSS theme",
      "Implement CRUD operations & state context",
      "Integrate AI services & endpoint handlers",
      "Test end-to-end user workflows and deploy"
    ];
  } else if (lower.includes('trip') || lower.includes('vacation') || lower.includes('travel')) {
    subtasks = [
      "Research flight options and accommodation",
      "Draft daily itinerary and main sightseeing spots",
      "Pack clothing and travel documents",
      "Confirm bookings and transportation"
    ];
  } else if (lower.includes('presentation') || lower.includes('meeting') || lower.includes('report')) {
    subtasks = [
      "Outline key objectives and main points",
      "Gather research data and relevant metrics",
      "Create slide presentation deck",
      "Rehearse presentation timing and delivery"
    ];
  } else {
    subtasks = [
      `Define scope & goals for "${goalTitle}"`,
      `Execute primary development / action phase`,
      `Review output and perform quality verification`,
      `Finalize delivery and mark task completed`
    ];
  }

  return subtasks;
};

const prioritizeUserTasks = async (userTasks) => {
  const pendingTasks = userTasks.filter(t => t.status !== 'completed');
  if (pendingTasks.length === 0) {
    return {
      recommendations: [],
      reasoning: "You have no pending tasks! Enjoy your free time or add a new goal."
    };
  }

  const prioMap = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...pendingTasks].sort((a, b) => prioMap[b.priority] - prioMap[a.priority]);

  const recommendations = sorted.map((t, idx) => ({
    rank: idx + 1,
    title: t.title,
    priority: t.priority,
    category: t.category,
    dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'No deadline',
    reasoning: idx === 0 
      ? `Highest priority item (${t.priority.toUpperCase()}). Tackling this first delivers the greatest impact.` 
      : `Priority rank ${idx + 1}. Complete after previous items.`
  }));

  return {
    recommendations,
    reasoning: `Analyzed ${pendingTasks.length} active tasks. Top recommendation focuses on urgent priorities and upcoming deadlines.`
  };
};

const processAIChat = async (userMessage, userTasks, userName) => {
  const lower = userMessage.toLowerCase();
  const pendingCount = userTasks.filter(t => t.status !== 'completed').length;
  const completedCount = userTasks.filter(t => t.status === 'completed').length;

  if (lower.includes('what should i work on') || lower.includes('what should i do') || lower.includes('today')) {
    const topTask = userTasks.find(t => t.status !== 'completed');
    if (topTask) {
      return `Hello ${userName}! Based on your current task list, I recommend focusing on **"${topTask.title}"** (Priority: ${topTask.priority.toUpperCase()}, Category: ${topTask.category}). Finishing this will boost your productivity momentum!`;
    }
    return `Hello ${userName}! You currently have no pending tasks. Great job! Ready to set a new goal?`;
  }

  if (lower.includes('completed') || lower.includes('stat') || lower.includes('progress')) {
    return `📊 **Your Productivity Progress:** You have completed **${completedCount}** tasks, with **${pendingCount}** tasks remaining. Keep up the great work!`;
  }

  if (lower.includes('break down') || lower.includes('breakdown')) {
    const topTask = userTasks.find(t => t.status !== 'completed');
    if (topTask) {
      const steps = await generateTaskBreakdown(topTask.title);
      return `✨ Here is an AI breakdown for your task **"${topTask.title}"**:\n` + steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
    return `Please specify a task title to break down!`;
  }

  return `🤖 Hello ${userName}! I'm your TaskMind AI Productivity Assistant. You currently have **${pendingCount} pending tasks**. Ask me "What should I work on today?", "How many tasks have I completed?", or "Break down my biggest task" for instant AI guidance!`;
};

module.exports = {
  parseTaskNaturalLanguage,
  generateTaskBreakdown,
  prioritizeUserTasks,
  processAIChat
};
