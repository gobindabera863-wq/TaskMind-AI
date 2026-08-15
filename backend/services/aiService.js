/**
 * TaskMind AI Backend Intelligence Service
 * Interacts with OpenAI API (or built-in smart NLP heuristic fallback if key is unavailable/error)
 */

const callOpenAI = async (messages, responseFormat = null) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const payload = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
    };
    if (responseFormat) {
      payload.response_format = responseFormat;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[OpenAI API Warning] Status ${res.status}: ${errText}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.warn('[OpenAI API Error] Falling back to smart NLP heuristics:', error.message);
    return null;
  }
};

const parseTaskNaturalLanguage = async (inputPrompt) => {
  const text = inputPrompt.trim();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Try OpenAI API first for rich parsing
  const aiResult = await callOpenAI([
    {
      role: 'system',
      content: `Analyze natural language task input and extract task fields.
Return ONLY a JSON object with keys:
"title" (clean main task title),
"priority" (one of: "urgent", "high", "medium", "low"),
"category" (one of: "work", "personal", "coding", "health", "finance", "learning"),
"dueDate" (ISO format YYYY-MM-DD or null if not specified),
"dueTime" (24-hour HH:MM format like "19:00" for 7 PM, or "" if not specified),
"subtasks" (array of 2 to 5 suggested subtask step titles if the input implies multiple topics, subjects, or steps, or empty array []).

Current date is ${todayStr}.`
    },
    { role: 'user', content: text }
  ], { type: 'json_object' });

  if (aiResult) {
    try {
      const parsed = JSON.parse(aiResult);
      if (parsed.title) {
        return {
          title: parsed.title,
          priority: parsed.priority || 'medium',
          category: parsed.category || 'personal',
          dueDate: parsed.dueDate || null,
          dueTime: parsed.dueTime || '',
          subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : []
        };
      }
    } catch (e) {
      // JSON parse fallback
    }
  }

  // Smart Heuristic Fallback
  let priority = 'medium';
  let category = 'personal';
  let dueDate = null;
  let dueTime = '';
  let cleanTitle = text;
  let subtasks = [];

  // Priority Extraction
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

  // Category Extraction
  if (/code|app|mern|react|node|bug|repo|git|api|html|css|database|sql|mongodb/i.test(text)) category = 'coding';
  else if (/gym|health|doctor|workout|run|diet/i.test(text)) category = 'health';
  else if (/email|meeting|client|report|project|slide/i.test(text)) category = 'work';
  else if (/exam|study|read|course|book|learn|dbms|cn|os|computer|science/i.test(text)) category = 'learning';
  else if (/pay|bank|bill|tax|money|budget/i.test(text)) category = 'finance';

  // Time Extraction (e.g., 7 PM, 7:00 PM, 19:00, 7pm)
  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] || '00';
    const ampm = timeMatch[3].toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    dueTime = `${String(hours).padStart(2, '0')}:${minutes}`;
    cleanTitle = cleanTitle.replace(timeMatch[0], '');
  }

  // Date Extraction
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
  } else if (/next week/i.test(text)) {
    const nextWk = new Date(today);
    nextWk.setDate(today.getDate() + 7);
    dueDate = nextWk.toISOString().split('T')[0];
    cleanTitle = cleanTitle.replace(/next week/gi, '');
  }

  // Clean trailing punctuation and words
  cleanTitle = cleanTitle.replace(/at\s*$/i, '').replace(/on\s*$/i, '').replace(/,\s*$/i, '').replace(/\s+/g, ' ').trim();
  if (!cleanTitle) cleanTitle = text;

  // Multiple topics / Exam subject subtask detection
  if (/exam|finish|study|need to finish/i.test(text)) {
    const subjects = [];
    if (/dbms/i.test(text)) subjects.push('Study DBMS');
    if (/cn|computer networks/i.test(text)) subjects.push('Study Computer Networks');
    if (/os|operating systems/i.test(text)) subjects.push('Study Operating Systems');
    if (subjects.length > 0) {
      subjects.push('Revision & Practice Questions');
      subtasks = subjects;
    }
  }

  if (subtasks.length === 0 && (category === 'coding' || cleanTitle.toLowerCase().includes('project'))) {
    subtasks = [
      'Setup backend & database schema',
      'Build core APIs & authentication',
      'Design user interface & components',
      'Test end-to-end features and deploy'
    ];
  }

  return {
    title: cleanTitle,
    priority,
    category,
    dueDate,
    dueTime,
    subtasks
  };
};

const generateTaskBreakdown = async (goalTitle) => {
  // Try OpenAI breakdown
  const aiResult = await callOpenAI([
    {
      role: 'system',
      content: 'You are an expert project management AI. Given a task or project title, break it down into 5 to 9 actionable step-by-step subtasks. Return a JSON object with key "subtasks" containing an array of step titles strings.'
    },
    { role: 'user', content: `Break down task: "${goalTitle}"` }
  ], { type: 'json_object' });

  if (aiResult) {
    try {
      const parsed = JSON.parse(aiResult);
      if (Array.isArray(parsed.subtasks) && parsed.subtasks.length > 0) {
        return parsed.subtasks;
      }
    } catch (e) {
      // JSON parse fallback
    }
  }

  // Smart Heuristic Fallback
  const lower = goalTitle.toLowerCase();
  let subtasks = [];

  if (lower.includes('mern') || lower.includes('full stack') || lower.includes('build mern project') || lower.includes('node') || lower.includes('react')) {
    subtasks = [
      "Setup project structure & repositories",
      "Configure backend Express server",
      "Configure MongoDB connection & schemas",
      "Create authentication & JWT endpoints",
      "Create REST API CRUD controllers",
      "Build React UI components & styles",
      "Connect frontend and backend services",
      "Test application end-to-end",
      "Deploy application to production"
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
      `Setup project requirements for "${goalTitle}"`,
      `Define architecture & core step breakdown`,
      `Execute primary implementation phase`,
      `Review output & perform testing verification`,
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

  // Try OpenAI prioritization
  const taskSummaries = pendingTasks.map((t, idx) => 
    `Task #${idx + 1}: "${t.title}" | Priority: ${t.priority} | Category: ${t.category} | Due: ${t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'None'}`
  ).join('\n');

  const aiResult = await callOpenAI([
    {
      role: 'system',
      content: `Analyze the user's pending task list and generate an optimal prioritized queue. Return ONLY a JSON object with:
"reasoning": (short overall explanation of the priority strategy),
"recommendations": array of objects with keys:
  - "rank": number (1, 2, ...),
  - "title": string,
  - "priority": string,
  - "category": string,
  - "dueDate": string,
  - "reasoning": string (why this rank)`
    },
    { role: 'user', content: `Pending Tasks:\n${taskSummaries}` }
  ], { type: 'json_object' });

  if (aiResult) {
    try {
      const parsed = JSON.parse(aiResult);
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        return {
          recommendations: parsed.recommendations,
          reasoning: parsed.reasoning || "Optimized based on urgency, deadline, and priority rank."
        };
      }
    } catch (e) {
      // fallback
    }
  }

  // Heuristic Fallback
  const prioMap = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...pendingTasks].sort((a, b) => prioMap[b.priority] - prioMap[a.priority]);

  const recommendations = sorted.map((t, idx) => ({
    rank: idx + 1,
    title: t.title,
    priority: t.priority,
    category: t.category,
    dueDate: t.dueDate ? (t.dueDate.toISOString ? t.dueDate.toISOString().split('T')[0] : String(t.dueDate).split('T')[0]) : 'No deadline',
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
  const pendingTasks = userTasks.filter(t => t.status !== 'completed');
  const completedTasks = userTasks.filter(t => t.status === 'completed');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const taskDateStr = t.dueDate.toISOString ? t.dueDate.toISOString().split('T')[0] : String(t.dueDate).split('T')[0];
    return taskDateStr < todayStr;
  });

  const pendingSummary = pendingTasks.length > 0 
    ? pendingTasks.map(t => `- "${t.title}" (Priority: ${t.priority.toUpperCase()}, Category: ${t.category}${t.dueDate ? `, Due: ${t.dueDate.toISOString ? t.dueDate.toISOString().split('T')[0] : String(t.dueDate).split('T')[0]}` : ''})`).join('\n')
    : 'None';

  const overdueSummary = overdueTasks.length > 0
    ? overdueTasks.map(t => `- "${t.title}"`).join('\n')
    : 'None';

  const systemPrompt = `You are TaskMind AI, an intelligent, friendly, and motivational personal productivity coach.
User Name: ${userName || 'User'}
Current Date: ${todayStr}

User Task Statistics:
- Total Tasks: ${userTasks.length}
- Completed Tasks: ${completedTasks.length}
- Pending Tasks (${pendingTasks.length}):
${pendingSummary}
- Overdue Tasks (${overdueTasks.length}):
${overdueSummary}

Guidelines:
1. Provide concise, actionable, and encouraging productivity advice.
2. Directly refer to the user's specific tasks, overdue deadlines, or high priority items when answering questions like "what should I work on", "show my progress", or "what is urgent".
3. Use bullet points and clean markdown formatting. Keep answers readable and engaging.`;

  const aiResult = await callOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]);

  if (aiResult) {
    return aiResult;
  }

  // Heuristic Fallback
  const lower = userMessage.toLowerCase();
  const pendingCount = pendingTasks.length;
  const completedCount = completedTasks.length;

  if (lower.includes('what should i work on') || lower.includes('what should i do') || lower.includes('today')) {
    const topTask = pendingTasks[0];
    if (topTask) {
      return `Hello ${userName}! Based on your current task list, I recommend focusing on **"${topTask.title}"** (Priority: ${topTask.priority.toUpperCase()}, Category: ${topTask.category}). Finishing this will boost your productivity momentum!`;
    }
    return `Hello ${userName}! You currently have no pending tasks. Great job! Ready to set a new goal?`;
  }

  if (lower.includes('completed') || lower.includes('stat') || lower.includes('progress')) {
    return `📊 **Your Productivity Progress:** You have completed **${completedCount}** tasks, with **${pendingCount}** tasks remaining. Keep up the great work!`;
  }

  if (lower.includes('break down') || lower.includes('breakdown')) {
    const topTask = pendingTasks[0];
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

