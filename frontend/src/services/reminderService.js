/**
 * TaskMind AI Non-Blocking Browser Reminder & Notification Service
 */

import * as taskService from './taskService';

// Request Browser Notification Permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Calculate Reminder Threshold Timestamp in milliseconds
export const getReminderThresholdTime = (dueDateStr, dueTimeStr, reminderType, customMins = 0) => {
  if (!dueDateStr) return null;

  try {
    const d = new Date(dueDateStr);
    if (isNaN(d.getTime())) return null;

    let hours = 12;
    let minutes = 0;

    if (dueTimeStr) {
      const parts = dueTimeStr.split(':');
      if (parts.length >= 2) {
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
      }
    }

    const dueTimestamp = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      hours,
      minutes,
      0
    ).getTime();

    let offsetMins = 0;
    if (reminderType === '15-min') offsetMins = 15;
    else if (reminderType === '30-min') offsetMins = 30;
    else if (reminderType === '1-hour') offsetMins = 60;
    else if (reminderType === '1-day') offsetMins = 24 * 60;
    else if (reminderType === 'custom') offsetMins = customMins || 15;

    return dueTimestamp - offsetMins * 60 * 1000;
  } catch (err) {
    return null;
  }
};

// Background Non-Blocking Reminder Engine
let reminderIntervalId = null;

export const initReminderEngine = (onNotificationTriggered) => {
  if (reminderIntervalId) clearInterval(reminderIntervalId);

  // Request permission quietly on startup
  requestNotificationPermission();

  // Run non-blocking check every 30 seconds
  reminderIntervalId = setInterval(async () => {
    try {
      const tasks = await taskService.getTasks();
      const now = Date.now();

      for (const task of tasks) {
        if (
          task.status === 'completed' ||
          !task.reminder ||
          task.reminder === 'none' ||
          task.reminderNotified
        ) {
          continue;
        }

        const thresholdTime = getReminderThresholdTime(
          task.dueDate,
          task.dueTime,
          task.reminder,
          task.reminderCustomMinutes
        );

        if (!thresholdTime) continue;

        // Check if now is past threshold time and within 1 hour after due date
        if (now >= thresholdTime && now < thresholdTime + 60 * 60 * 1000) {
          // Trigger Web Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⚡ TaskMind AI Reminder: ${task.title}`, {
              body: `Priority: ${task.priority.toUpperCase()} | Due: ${task.dueTime || 'Today'}`,
              icon: '/favicon.ico'
            });
          }

          // Trigger internal App Toast callback
          if (onNotificationTriggered) {
            onNotificationTriggered(task);
          }

          // Mark notified in backend
          await taskService.updateTask(task._id, { reminderNotified: true });
        }
      }
    } catch (err) {
      // Non-blocking catch to prevent app interruption
    }
  }, 30000);
};
