# ✨ TaskMind AI — Smart AI-Powered Task & Productivity Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

> **TaskMind AI** is a full-stack, AI-enhanced task management and productivity application built with the **MERN Stack** (MongoDB, Express, React 19, Node.js) and powered by **OpenAI**. It features natural language task creation, automated task breakdown, AI priority recommendations, an interactive productivity AI chatbot assistant, and a zero-downtime dual data engine.

### 🏷️ Keywords & Repository Topics
`mern-stack` • `react19` • `vite` • `nodejs` • `expressjs` • `mongodb` • `openai-api` • `ai-task-manager` • `productivity-app` • `natural-language-processing` • `ai-chatbot` • `tailwind-css` • `jwt-authentication` • `otp-verification` • `fullstack-javascript` • `rest-api` • `todo-app`

---


## 📸 Key Highlights & Features

### 🤖 AI-Powered Intelligence
- **Natural Language Task Parsing**: Enter freeform input (e.g. *"Prepare presentation for client demo by tomorrow 4pm high priority"*) and let AI automatically extract title, description, category, due date, and priority level.
- **Automated Task Breakdown**: Deconstruct complex tasks into actionable subtasks with a single click.
- **Smart AI Task Prioritization**: AI analyzes your active backlog and recommends optimal task order based on deadlines, effort, and importance.
- **Context-Aware Productivity Assistant**: Interactive AI Chatbot that reads your live tasks and answers questions, suggests schedules, and helps organize your workday.

### ⚡ Resilient Dual Data Engine
- **MongoDB Database**: Persistent storage with Mongoose ODM (supports local MongoDB & MongoDB Atlas).
- **Smart In-Memory Fallback**: Automatic zero-config fallback to an in-memory data store if a local MongoDB service is offline, ensuring the application remains testable out-of-the-box.

### 🔐 Secure Authentication & User Management
- **JWT Authentication & Passwords**: Password hashing via `bcryptjs` and stateless JWT authorization.
- **OTP Email Verification**: Automated 6-digit OTP verification powered by `Nodemailer` with fallback preview logging.
- **User Profiles**: Profile management and personalized user workspaces.

### 🎨 Modern & Responsive UI/UX
- **Glassmorphic Dark Theme**: Built with React 19, Vite, Tailwind CSS, and `lucide-react` icons.
- **Dynamic Task Management**: Filter by category/priority/status, instant search bar, task statistics dashboard, and inline editing.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM v7, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Token (JWT), bcryptjs, Nodemailer, Express Validator |
| **Database** | MongoDB (Primary) / TaskMind Smart In-Memory Store (Fallback) |
| **AI Integration** | OpenAI API (with intelligent heuristic fallback engine) |

---

## 📂 Project Architecture

```text
TO DO List/
├── backend/                  # Express REST API Server
│   ├── config/               # Database connection & fallback configuration
│   ├── controllers/          # Request handlers (auth, tasks, AI)
│   ├── middleware/           # JWT auth & error handling middlewares
│   ├── models/               # Mongoose data schemas (User, Task, OTP)
│   ├── routes/               # API route definitions
│   ├── services/             # AI service & email transport services
│   ├── utils/                # Helper utilities (OTP generator)
│   ├── .env                  # Backend environment variables
│   ├── package.json          # Backend dependencies & scripts
│   └── server.js             # Entry point
│
├── frontend/                 # React 19 + Vite Web Application
│   ├── public/               # Static public assets
│   ├── src/
│   │   ├── components/       # Reusable UI components (TaskCard, AIChat, Navbar, etc.)
│   │   ├── context/          # React Context (AuthContext, TaskContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # View pages (Dashboard, Login, Register, Profile, Landing)
│   │   ├── routes/           # Protected & public routing
│   │   ├── services/         # Axios API clients
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx          # Vite root entry
│   ├── .env                  # Frontend environment variables
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vite.config.js        # Vite bundler configuration
│   └── package.json          # Frontend dependencies & scripts
│
└── README.md                 # Project Documentation
```

---

## 🔌 API Reference

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user & send OTP | Public |
| `POST` | `/api/auth/verify-otp` | Verify email OTP & get JWT token | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `PUT` | `/api/auth/profile` | Update user profile details | Private |

### 📋 Task Management Routes (`/api/tasks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get user tasks (with search & filter query params) | Private |
| `POST` | `/api/tasks` | Create a new task | Private |
| `PUT` | `/api/tasks/:id` | Update an existing task | Private |
| `DELETE` | `/api/tasks/:id` | Delete a task | Private |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle task completion status | Private |

### 🤖 AI Routes (`/api/ai`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/parse-task` | Parse natural language text into task JSON | Private |
| `POST` | `/api/ai/breakdown` | Generate subtasks for a task title | Private |
| `POST` | `/api/ai/prioritize` | Get AI priority recommendation for backlog | Private |
| `POST` | `/api/ai/chat` | Interactive AI productivity chatbot | Private |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- *(Optional)* **MongoDB**: Local MongoDB server or MongoDB Atlas cluster URI

---

### 1️⃣ Installation

Clone the repository and install dependencies for both backend and frontend:

```bash
# Clone the repository
git clone https://github.com/gobindabera863-wq/TaskMind-AI.git
cd TaskMind-AI

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2️⃣ Environment Configuration

#### Backend Environment (`backend/.env`)
Create a `.env` file inside the `backend` directory (or use `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskmind_ai
JWT_SECRET=your_super_secret_jwt_key_here

# OpenAI API Key (Optional — fallback heuristic parser active if omitted)
OPENAI_API_KEY=sk-your-openai-api-key

# SMTP Email Configuration (Optional — console OTP preview active if omitted)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="TaskMind AI <your_email@gmail.com>"
```

#### Frontend Environment (`frontend/.env`)
Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3️⃣ Running the Application

Open two terminal windows:

#### Terminal 1 — Start Backend API Server
```bash
cd backend
npm run dev
```
*Server will launch on `http://localhost:5000`*

#### Terminal 2 — Start Frontend Application
```bash
cd frontend
npm run dev
```
*Vite web application will launch on `http://localhost:5173`*

---

## ⚡ Data Engine Modes Explained

TaskMind AI handles database connection gracefully:

1. **MongoDB Mode (Default)**: Connects to local MongoDB daemon or MongoDB Atlas URI provided in `MONGODB_URI`. All data persists across server restarts.
2. **In-Memory Smart Data Store Mode**: If MongoDB is offline, the backend issues a log warning and seamlessly switches to an in-memory data store. The app continues working smoothly without crashing or requiring software installation.

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center>
Made with ❤️ by <strong>TaskMind AI Team</strong>
</p>

