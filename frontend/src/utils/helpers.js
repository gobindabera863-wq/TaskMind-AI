export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(dateString).toISOString().split('T')[0];

    const today = new Date(todayStr);
    const due = new Date(dueStr);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) {
      const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `Overdue (${formatted})`;
    }

    return due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return '';
  }
};

export const isOverdue = (dateString, status, dueTime) => {
  if (!dateString || status === 'completed') return false;
  try {
    const due = new Date(dateString);
    if (isNaN(due.getTime())) return false;

    if (dueTime && typeof dueTime === 'string') {
      const [hours, minutes] = dueTime.split(':');
      if (hours !== undefined && minutes !== undefined) {
        due.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      }
    } else {
      due.setHours(23, 59, 59, 999);
    }
    return new Date() > due;
  } catch (e) {
    return false;
  }
};

export const getStatusBadgeClass = (status, overdue) => {
  if (status === 'completed') {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
  if (overdue || status === 'overdue') {
    return 'bg-red-500/20 text-red-400 border-red-500/30 border animate-pulse';
  }
  if (status === 'in-progress') {
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
  return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
};

export const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'work':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'personal':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'health':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'learning':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'finance':
      return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    case 'coding':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const extractTags = (task) => {
  const tagsSet = new Set();

  if (task.tags && Array.isArray(task.tags)) {
    task.tags.forEach(t => tagsSet.add(t.startsWith('#') ? t : `#${t}`));
  }

  // Parse hashtags from title and description
  const text = `${task.title || ''} ${task.description || ''}`;
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (matches) {
    matches.forEach(m => tagsSet.add(m));
  }

  if (task.category) {
    tagsSet.add(`#${task.category}`);
  }

  return Array.from(tagsSet);
};

export const getProductivityLabel = (score) => {
  if (score >= 90) return '⚡ Outstanding';
  if (score >= 75) return '🔥 Excellent';
  if (score >= 60) return '💪 Good Progress';
  if (score >= 40) return '📈 Building Momentum';
  return '🌱 Getting Started';
};

