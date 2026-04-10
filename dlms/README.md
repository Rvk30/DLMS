# 📚 DLMS — Digital Library Management System

> A full-stack, production-ready Library Management System built for colleges and educational institutions. Students can search and borrow books online, and librarians get a powerful admin dashboard to manage the entire library digitally.

![Project Banner — Add a screenshot of the homepage here](./screenshots/banner.png)

---

## 📋 Table of Contents
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Database Schema](#-database-schema)
- [API Overview](#-api-overview)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Email System](#-email-system)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Conclusion](#-conclusion)

---

## 🔴 Problem Statement

Traditional college libraries still rely on paper registers and manual processes:

- ❌ Students don't know which books are available without physically visiting
- ❌ Librarians maintain multiple handwritten registers for issue/return
- ❌ Fine calculation is manual and error-prone
- ❌ There's no automated reminder system for due dates
- ❌ No digital record for audit or history

**Result:** Inefficiency, lost records, and a poor experience for both students and librarians.

---

## ✅ Solution Overview

DLMS digitalizes the entire library workflow:

- Students can **search books**, **borrow online**, and **track their dues** from any device
- Librarians get a **full admin dashboard** for inventory, user, and fine management
- The system **automatically calculates fines** (₹2/day) and sends **email reminders**
- All data is stored securely in a **hosted PostgreSQL database** (via Supabase)

---

## ✨ Features

### 👨‍🎓 Student Portal
- ✅ Register & Login with JWT Authentication
- ✅ Email verification on signup
- ✅ Search books by title, author, category
- ✅ Borrow books with confirmation modal (max 3 at a time)
- ✅ View borrowed books, due dates, and return status
- ✅ View and pay fines
- ✅ Forgot Password / Reset Password flow
- ✅ Email notifications for borrow confirmation, due reminders & overdue alerts

### 🧑‍💼 Librarian Dashboard
- ✅ Full CRUD for Books (Add, Edit, Delete, View)
- ✅ Issue and Return books on behalf of students
- ✅ Manage all students and librarian accounts
- ✅ View full transaction history with filters
- ✅ View, pay, and waive student fines
- ✅ Dashboard statistics (total books, issued, overdue, fines collected)
- ✅ Daily automated overdue detection via cron scheduler

---

## 🛠️ Tech Stack

| Layer | Technology | Why Used |
|-------|-----------|----------|
| **Frontend** | Next.js 14 (App Router) | React framework with SSR, fast routing, and great DX |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + accessible, production-ready components |
| **State Management** | Zustand | Lightweight global auth state |
| **Data Fetching** | TanStack React Query | Server state management with caching and auto-refetch |
| **Backend** | Node.js + Express.js | Fast, minimal REST API server |
| **ORM** | Prisma 5 | Type-safe database queries with auto-generated client |
| **Database** | PostgreSQL | Relational DB, perfect for structured library data |
| **Database Host** | Supabase | Free, managed Postgres with a great dashboard |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, secure auth for API calls |
| **Email** | Resend SDK | Reliable transactional email delivery (no SMTP issues) |
| **Deployment** | Vercel (frontend) + Render (backend) | Free-tier production hosting |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
│              Next.js 14 (Vercel)                         │
│         Student Portal  |  Librarian Dashboard           │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS API calls
                   │ (NEXT_PUBLIC_API_URL)
┌──────────────────▼──────────────────────────────────────┐
│                 EXPRESS.JS BACKEND (Render)               │
│  Routes → Controllers → Services → Prisma ORM            │
│  JWT Middleware | Rate Limiting | CORS | Helmet           │
│  Cron Scheduler (daily overdue detection)                 │
└──────────────────┬──────────────────────────────────────┘
                   │ Prisma Client (DATABASE_URL)
┌──────────────────▼──────────────────────────────────────┐
│            SUPABASE (PostgreSQL Database)                 │
│  users | students | books | transactions | fines          │
└─────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│               RESEND (Email Service)                      │
│  Verification | Book Issued | Due Reminder | Overdue      │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
dlms/
├── package.json              ← Monorepo root (concurrently)
├── .gitignore
├── README.md
├── SETUP.md
├── DEPLOYMENT.md
│
├── backend/                  ← Express + Prisma API
│   ├── .env                  ← Backend secrets (never commit!)
│   ├── .env.example          ← Template for env setup
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── prisma/
│   │   ├── schema.prisma     ← Complete DB schema (6 models)
│   │   ├── seed.ts           ← Database seeding script
│   │   └── migrations/       ← Auto-generated migration files
│   │
│   └── src/
│       ├── index.ts          ← App entry point, middleware setup
│       ├── config/
│       │   ├── database.ts   ← Prisma client singleton
│       │   └── mailer.ts     ← Resend email client singleton
│       ├── controllers/      ← Request handlers (auth, book, transaction...)
│       ├── middleware/        ← JWT auth, role guards
│       ├── routes/           ← API route definitions
│       ├── services/         ← Business logic layer
│       ├── types/            ← TypeScript interfaces & DTOs
│       └── utils/            ← AppError, helpers
│
└── frontend/                 ← Next.js 14 app
    ├── .env                  ← Frontend env (NEXT_PUBLIC_API_URL)
    ├── .env.example
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    │
    └── src/
        ├── app/              ← Next.js App Router pages
        │   ├── (auth)/       ← Login, Register, Forgot/Reset Password
        │   ├── dashboard/    ← Student dashboard
        │   ├── search/       ← Book search
        │   ├── transactions/ ← Borrowing history
        │   ├── fines/        ← Fine management
        │   ├── books/        ← All books listing
        │   └── admin/        ← Librarian dashboard
        ├── components/       ← Reusable UI components & modals
        ├── hooks/            ← Custom React hooks
        ├── lib/              ← API client (axios wrapper)
        └── store/            ← Zustand auth store
```

---

## 🗄️ Database Schema

The database has **6 core models** connected relationally:

```
User (base profile)
 ├── Student (role=STUDENT) ──→ Account (lifetime stats)
 │                          ──→ Transaction[] (borrows)
 │                                  └──→ Fine (if overdue)
 └── Librarian (role=LIBRARIAN)

Book ──→ Transaction[] (who borrowed it)
```

| Model | Purpose |
|-------|---------|
| `User` | Base auth record (email, password, role, reset tokens) |
| `Student` | Student profile (roll number, class, borrow count) |
| `Librarian` | Librarian profile (employee ID, department) |
| `Book` | Book inventory (ISBN, copies, category, status) |
| `Transaction` | Borrow/return records (dates, status, remarks) |
| `Fine` | Overdue fines (₹2/day, waiver support) |
| `Account` | Student's lifetime library stats |

---

## 🔌 API Overview

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register student or librarian |
| POST | `/login` | Login & get JWT tokens |
| POST | `/logout` | Invalidate session |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password` | Set new password with token |
| GET | `/verify-email` | Verify email via token |

### Book Routes (`/api/books`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search` | Any | Search books with filters |
| GET | `/` | Librarian | Get all books |
| POST | `/` | Librarian | Add new book |
| PUT | `/:id` | Librarian | Update book |
| DELETE | `/:id` | Librarian | Delete book |

### Transaction Routes (`/api/transactions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/borrow` | Student | Borrow a book |
| POST | `/return` | Librarian | Return a book |
| GET | `/my-books` | Student | Get own borrowed books |
| GET | `/` | Librarian | Get all transactions |

### Fine Routes (`/api/fines`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my-fines` | Student | View own fines |
| POST | `/:id/pay` | Librarian | Mark fine as paid |
| POST | `/:id/waive` | Librarian | Waive a fine |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
# Database (Supabase PostgreSQL connection string)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# JWT
JWT_SECRET="your-very-long-random-secret-key"

# Email (Resend)
RESEND_API_KEY="re_your_key_here"
EMAIL_FROM="DLMS Library <onboarding@resend.dev>"

# App
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
PORT=5000
MAX_BORROW_LIMIT=3
FINE_PER_DAY=2
```

### Frontend (`frontend/.env`)
```env
# Points to the backend API
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

> **⚠️ Important:** Never commit `.env` files to Git. Use `.env.example` as a template.

---

## 🚀 Installation & Setup

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) v18 or above
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account (free tier)
- A [Resend](https://resend.com/) account (free tier)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rvk30/DLMS.git
cd DLMS/dlms
```

### Step 2: Install All Dependencies
```bash
npm install           # Install monorepo root deps
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: Set Up Supabase Database
1. Go to [supabase.com](https://supabase.com/) → Create a new project
2. Go to **Project Settings → Database → Connection String**
3. Copy the **URI** connection string
4. Replace `[YOUR-PASSWORD]` in the string with your DB password

### Step 4: Set Up Environment Variables
```bash
# Backend
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL, JWT_SECRET, RESEND_API_KEY, etc.

# Frontend
cp frontend/.env.example frontend/.env
# Set: NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 5: Run Database Migrations
```bash
cd backend
npx prisma migrate deploy
# OR for development:
npx prisma migrate dev --name init
```

### Step 6: (Optional) Seed the Database
```bash
cd backend
npx ts-node prisma/seed.ts
```

---

## ▶️ Running Locally

### Option A: Run Both (Recommended)
From the `dlms/` root folder:
```bash
npm run dev
```
This uses `concurrently` to start both servers simultaneously.

### Option B: Run Separately
```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server starts at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App opens at http://localhost:3000
```

---

## 📧 Email System

DLMS uses **Resend** (not Gmail SMTP) for sending all transactional emails:

| Email Type | When Triggered |
|-----------|----------------|
| Email Verification | On new user registration |
| Book Issued | When a book is borrowed |
| Due Date Reminder | 3 days before due date (daily cron) |
| Overdue Alert | Every day after due date passes |
| Password Reset | When user requests forgot-password |

> Emails are sent via HTTP API (no SMTP port blocking issues on Render free tier).

---

## 📸 Screenshots

> Add your screenshots in a `screenshots/` folder and reference them below.

| Page | Screenshot |
|------|-----------|
| Login Page | `![Login](./screenshots/login.png)` |
| Student Dashboard | `![Dashboard](./screenshots/dashboard.png)` |
| Book Search | `![Search](./screenshots/search.png)` |
| Borrow Modal | `![Borrow](./screenshots/borrow-modal.png)` |
| Librarian Admin | `![Admin](./screenshots/admin.png)` |
| Fine Management | `![Fines](./screenshots/fines.png)` |

---

## 🔮 Future Improvements

- [ ] **Book Reservation System** — Reserve books that are currently borrowed
- [ ] **QR Code** on each book for quick scan-based issue/return
- [ ] **Mobile App** (React Native) for students
- [ ] **SMS Notifications** via Twilio
- [ ] **Analytics Dashboard** — Charts for borrowing trends, popular books
- [ ] **Multi-branch Support** — Manage multiple library branches
- [ ] **Book Recommendation Engine** using ML
- [ ] **Online Fine Payment** via Razorpay / UPI integration
- [ ] **Dark Mode** toggle

---

## 🎓 Conclusion

DLMS is a complete, production-grade library management system that solves real problems faced by college libraries. It demonstrates:

- **Full-Stack Development** (Next.js + Express + Prisma)
- **Secure Authentication** (JWT + Role-based access)
- **Database Design** (6 related models, indexes, transactions)
- **Cloud Deployment** (Vercel + Render + Supabase)
- **Email Automation** (Resend API)
- **Clean Architecture** (Controller → Service → Repository pattern)

Built with ❤️ for college students and librarians.

---

> 📂 **Related Docs:** [SETUP.md](./SETUP.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)
