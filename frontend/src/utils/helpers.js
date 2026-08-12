export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const isOverdue = (dateString, status) => {
  if (!dateString || status === 'completed') return false;
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(dateString).toISOString().split('T')[0];
  return due < today;
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
