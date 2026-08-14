# 🚀 TaskMind AI (Smart AI Task Manager & Productivity Platform)

An end-to-end, AI-powered full-stack web application designed to manage, prioritize, and optimize daily tasks and workflows. Powered by **OpenAI**, **React 19**, **Node.js/Express**, and **MongoDB**.

---

## ✨ Features

- 📄 **Natural Language Task Parsing**: Input freeform text (e.g., *"Prepare client presentation by tomorrow 4pm high priority"*) and automatically extract title, due date, category, and priority level.
- 🤖 **AI-Driven Task Breakdown**: Deconstruct complex or overwhelming goals into actionable step-by-step subtasks using OpenAI.
- 🧠 **Smart AI Task Prioritizer**: Analyze active task backlogs to recommend optimal execution order based on deadlines, effort, and importance.
- 💬 **Context-Aware AI Chatbot**: Interactive productivity assistant that reads your live tasks to answer questions, suggest daily schedules, and optimize your workflow.
- 📊 **Analytics Dashboard**: Real-time task metrics, completion counters, category breakdowns, and priority filtering.
- 🔐 **Authentication & Security**: Secure user registration, login, JWT authorization with `jsonwebtoken`, password hashing with `bcryptjs`, and email OTP verification powered by `nodemailer`.
- ⚡ **Dual Data Engine**: Persistent storage via MongoDB (Mongoose ODM), paired with a zero-downtime automatic fallback to an in-memory smart data store if MongoDB service is offline.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Router DOM v7
- **Backend**: Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `nodemailer`, `express-validator`
- **Database**: MongoDB (Mongoose ODM) / TaskMind Smart In-Memory Store
- **AI Integration**: OpenAI API (with intelligent heuristic fallback engine)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/gobindabera863-wq/TaskMind-AI.git
cd TaskMind-AI
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskmind_ai
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend application:
```bash
npm run dev
```

Access the application interface at `http://localhost:5173`.

---

## 🔌 API Endpoints Reference

### 🔑 Authentication
- `POST /api/auth/register` — Register user & dispatch 6-digit email OTP
- `POST /api/auth/verify-otp` — Verify OTP & issue JWT authentication token
- `POST /api/auth/login` — User authentication & login
- `GET /api/auth/me` — Retrieve authenticated user profile
- `PUT /api/auth/profile` — Update user profile information

### 📋 Task Management
- `GET /api/tasks` — Fetch user tasks with search, category, and priority filters
- `POST /api/tasks` — Create a new task
- `PUT /api/tasks/:id` — Edit existing task details
- `DELETE /api/tasks/:id` — Delete a task
- `PATCH /api/tasks/:id/toggle` — Toggle task completion status

### 🤖 AI Engine
- `POST /api/ai/parse-task` — Parse freeform natural language text into structured task object
- `POST /api/ai/breakdown` — Generate AI subtask breakdown steps for a task
- `POST /api/ai/prioritize` — AI priority ordering and backlog recommendations
- `POST /api/ai/chat` — Context-aware AI productivity chatbot assistant

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.




