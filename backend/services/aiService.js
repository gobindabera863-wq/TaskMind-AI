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

  // Try OpenAI API first for rich parsing
  const aiResult = await callOpenAI([
    {
      role: 'system',
      content: `Extract task parameters from input text. Return ONLY a JSON object with keys:
"title" (clean task title),
"priority" (one of: "urgent", "high", "medium", "low"),
"category" (one of: "work", "personal", "coding", "health", "finance", "learning"),
"dueDate" (ISO YYYY-MM-DD or null if not specified).
Current date is ${new Date().toISOString().split('T')[0]}.`
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
          dueDate: parsed.dueDate || null
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
  let cleanTitle = text;

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

  if (/code|app|bug|repo|git|api|html|css|react/i.test(text)) category = 'coding';
  else if (/gym|health|doctor|workout|run|diet/i.test(text)) category = 'health';
  else if (/email|meeting|client|report|project|slide/i.test(text)) category = 'work';
  else if (/study|read|course|book|learn/i.test(text)) category = 'learning';
  else if (/pay|bank|bill|tax|money|budget/i.test(text)) category = 'finance';

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
  // Try OpenAI breakdown
  const aiResult = await callOpenAI([
    {
      role: 'system',
      content: 'You are a project planning assistant. Given a project or goal title, break it down into 4 to 6 logical, actionable step-by-step subtasks. Return a JSON object with a key "subtasks" containing an array of strings.'
    },
    { role: 'user', content: `Goal: "${goalTitle}"` }
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

  // Heuristic Fallback
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

