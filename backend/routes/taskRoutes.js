const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Protect all task routes
router.use(protect);

router.get('/stats', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(
    [
      check('title', 'Task title is required').notEmpty(),
      validate
    ],
    createTask
  );

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/complete', toggleTaskComplete);

module.exports = router;
