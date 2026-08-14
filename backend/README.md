# 🚀 TaskMind AI Backend (REST API Server)

An end-to-end, AI-powered REST API backend service built with **Node.js**, **Express.js**, **MongoDB / Mongoose**, and **OpenAI**. Supports user authentication, JWT security, email OTP verification, task CRUD operations, natural language parsing, and AI task breakdown.

---

## ✨ Features

- 🔑 **Authentication & Security**: User registration, login, JWT token verification with `jsonwebtoken`, password hashing with `bcryptjs`, and email OTP verification via `nodemailer`.
- 📋 **Task Management REST API**: Full CRUD endpoints for managing tasks with search, category filtering, priority filtering, and task completion toggles.
- 📄 **Natural Language Task Parsing**: Parse freeform text strings into structured task objects using OpenAI API or smart heuristic parser.
- 🤖 **AI-Driven Subtask Breakdown**: Deconstruct complex tasks into actionable subtasks automatically.
- 🧠 **Smart AI Task Prioritization**: Analyze user task backlogs to recommend optimal execution order based on deadlines and importance.
- 💬 **Context-Aware Productivity Chatbot**: AI endpoint that reads current user tasks and responds to productivity queries.
- ⚡ **Dual Data Engine**: Native connection to MongoDB with an automated fallback to an in-memory smart data store if local MongoDB service is offline.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (`v18+`)
- **Framework**: Express.js (`v4.19`)
- **Database**: MongoDB & Mongoose ODM (`v8.4`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Email Service**: Nodemailer (`nodemailer`)
- **Validation**: Express Validator (`express-validator`)
- **AI Engine**: OpenAI API (`openai`)

---

## 📂 Backend Architecture

```text
backend/
├── config/             # Database connection & fallback logic (db.js)
├── controllers/        # Route logic handlers (auth, tasks, AI)
├── middleware/         # Auth verification & error handling
├── models/             # Mongoose schemas (User, Task, OTP)
├── routes/             # Express API routes (authRoutes, taskRoutes, aiRoutes)
├── services/           # OpenAI & Nodemailer transport services
├── utils/              # Helper utilities (token generator, OTP helper)
├── .env.example        # Environment variables template
├── package.json        # Dependencies & scripts
└── server.js           # Express application entry point
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` file in the `backend` root:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskmind_ai
JWT_SECRET=your_super_secret_jwt_key

# OpenAI API Key (Optional — fallback parser active if omitted)
OPENAI_API_KEY=your_openai_api_key

# SMTP Email Configuration (Optional — console OTP preview active if omitted)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM="TaskMind AI <your_email@gmail.com>"
```

### 3. Run Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`.

---

## 🔌 API Endpoints Reference

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user & dispatch email OTP
- `POST /api/auth/verify-otp` — Verify OTP & issue JWT authentication token
- `POST /api/auth/login` — User login & JWT issuance
- `GET /api/auth/me` — Get current user profile *(Private)*
- `PUT /api/auth/profile` — Update user profile *(Private)*

### 📋 Task Management (`/api/tasks`)
- `GET /api/tasks` — List user tasks *(Private)*
- `POST /api/tasks` — Create task *(Private)*
- `PUT /api/tasks/:id` — Update task *(Private)*
- `DELETE /api/tasks/:id` — Delete task *(Private)*
- `PATCH /api/tasks/:id/toggle` — Toggle complete *(Private)*

### 🤖 AI Services (`/api/ai`)
- `POST /api/ai/parse-task` — Parse natural language task input *(Private)*
- `POST /api/ai/breakdown` — Generate AI subtask breakdown *(Private)*
- `POST /api/ai/prioritize` — AI priority recommendation *(Private)*
- `POST /api/ai/chat` — Context-aware AI chatbot assistant *(Private)*

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.
