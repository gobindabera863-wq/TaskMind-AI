const express = require('express');
const router = express.Router();
const { parseTaskNLP, taskBreakdown, prioritizeTasks, aiChat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/parse-task', parseTaskNLP);
router.post('/breakdown', taskBreakdown);
router.post('/prioritize', prioritizeTasks);
router.post('/chat', aiChat);

module.exports = router;
