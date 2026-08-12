const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; background: #020617; color: #fff; padding: 40px; text-align: center; min-height: 100vh;">
      <h1 style="color: #6366f1;">✨ TaskMind AI Backend REST API</h1>
      <p style="color: #94a3b8;">The backend server is running smoothly on port 5000.</p>
      <p style="margin-top: 20px;">
        👉 <strong>To open the web application interface, visit:</strong> 
        <a href="http://localhost:5173" style="color: #8b5cf6; font-size: 18px; font-weight: bold;">http://localhost:5173</a>
      </p>
    </div>
  `);
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TaskMind AI REST API Server is running smoothly 🚀',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TaskMind AI Express Server running on port ${PORT}`);
});
