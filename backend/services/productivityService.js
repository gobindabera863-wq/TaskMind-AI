/**
 * TaskMind AI Deterministic Productivity Scoring Service
 * Scale: 0 to 100
 */

const calculateProductivityScore = (userTasks) => {
  if (!userTasks || userTasks.length === 0) {
    return {
      score: 0,
      label: '🌱 Getting Started',
      badgeColor: 'text-slate-400 border-slate-700 bg-slate-800/50',
      currentStreak: 0,
      breakdown: {
        completionRatePts: 0,
        volumePts: 0,
        highPriorityBonusPts: 0,
        streakBonusPts: 0,
        consistencyPts: 0,
        overduePenaltyPts: 0
      }
    };
  }

  const total = userTasks.length;
  const completedTasks = userTasks.filter(t => t.status === 'completed');
  const completedCount = completedTasks.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = userTasks.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    try {
      const d = new Date(t.dueDate);
      if (isNaN(d.getTime())) return false;
      return d.toISOString().split('T')[0] < todayStr;
    } catch (e) {
      return false;
    }
  }).length;

  // Factor 1: Completion Rate % (0 to 35 points)
  const completionRate = Math.round((completedCount / total) * 100);
  const completionRatePts = Math.round((completionRate / 100) * 35);

  // Factor 2: Total Volume of Completed Tasks (0 to 15 points)
  const volumePts = Math.min(15, Math.round(completedCount * 1.5));

  // Factor 3: High Priority & Urgent Completed Tasks (0 to 20 points)
  const highPrioCompleted = completedTasks.filter(
    t => t.priority === 'high' || t.priority === 'urgent'
  ).length;
  const highPriorityBonusPts = Math.min(20, highPrioCompleted * 4);

  // Factor 4: Current Streak (0 to 15 points)
  const completedDates = new Set(
    completedTasks
      .filter(t => t.completedAt || t.updatedAt || t.createdAt)
      .map(t => new Date(t.completedAt || t.updatedAt || t.createdAt).toISOString().split('T')[0])
  );

  let currentStreak = 0;
  if (completedDates.size > 0) {
    let checkDate = new Date();
    let checkStr = checkDate.toISOString().split('T')[0];

    if (!completedDates.has(checkStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }

    while (completedDates.has(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
    }
  }
  const streakBonusPts = Math.min(15, currentStreak * 3);

  // Factor 5: Consistency (0 to 15 points)
  const distinctDaysActive = completedDates.size;
  const consistencyPts = Math.min(15, distinctDaysActive * 3);

  // Factor 6: Overdue Penalty (-4 points per overdue task, max -25 points)
  const overduePenaltyPts = Math.min(25, overdueCount * 4);

  // Calculate Raw Final Score (Bounded 0 to 100)
  const rawScore = completionRatePts + volumePts + highPriorityBonusPts + streakBonusPts + consistencyPts - overduePenaltyPts;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Status Label Assignment
  let label = '🌱 Getting Started';
  let badgeColor = 'text-slate-400 border-slate-700 bg-slate-800/50';

  if (score >= 90) {
    label = '⚡ Outstanding';
    badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-amber-500/20';
  } else if (score >= 75) {
    label = '🔥 Excellent';
    badgeColor = 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 shadow-indigo-500/20';
  } else if (score >= 60) {
    label = '💪 Good Progress';
    badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/20';
  } else if (score >= 40) {
    label = '📈 Building Momentum';
    badgeColor = 'text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-purple-500/20';
  }

  return {
    score,
    label,
    badgeColor,
    currentStreak,
    breakdown: {
      completionRatePts,
      volumePts,
      highPriorityBonusPts,
      streakBonusPts,
      consistencyPts,
      overduePenaltyPts
    }
  };
};

module.exports = {
  calculateProductivityScore
};
