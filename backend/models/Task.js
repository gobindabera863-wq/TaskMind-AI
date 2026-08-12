const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['work', 'personal', 'health', 'learning', 'finance', 'coding'],
      default: 'personal'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    dueDate: {
      type: Date,
      default: null
    },
    dueTime: {
      type: String,
      default: ''
    },
    subtasks: [
      {
        id: { type: String },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    estimatedTime: {
      type: Number,
      default: 25
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);
