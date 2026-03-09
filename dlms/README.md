# 📚 Digital Library Management System (DLMS)

A modern, full-stack digital library management system built with Next.js 14, Express.js, PostgreSQL, and Prisma ORM.

---

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend    | Node.js + Express.js + TypeScript   |
| Database   | PostgreSQL + Prisma ORM             |
| Auth       | JWT + Nodemailer email verification |
| Deploy     | Vercel + Railway + Supabase         |

---

## 📁 Project Structure

```
dlms/
├── frontend/          # Next.js 14 App
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   │   ├── (auth)/   # login, register
│   │   │   ├── dashboard/
│   │   │   ├── search/
│   │   │   ├── transactions/
│   │   │   └── admin/    # librarian panel
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # API clients, utilities
│   │   ├── store/        # Zustand state management
│   │   └── types/        # TypeScript interfaces
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── backend/           # Express.js REST API
│   ├── src/
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, error
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers (email, jwt, etc.)
│   │   ├── config/       # DB, env config
│   │   └── index.ts      # Entry point
│   ├── prisma/
│   │   ├── schema.prisma # DB schema
│   │   └── seed.ts       # Test data seeder
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/your-org/dlms.git
cd dlms

# Install root workspace deps
npm install

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Configure Environment
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DB URL, JWT secret, SMTP credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API URL
```

### 3. Set Up Database
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Servers
```bash
# From root (runs both concurrently)
npm run dev

# Or separately:
# Terminal 1 - Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend && npm run dev
```

---

## 👥 Roles & Permissions

| Feature               | Student | Librarian |
|-----------------------|---------|-----------|
| Search books          | ✅      | ✅        |
| Request/borrow book   | ✅      | ✅        |
| View own history      | ✅      | ✅        |
| Manage all books      | ❌      | ✅        |
| Issue/return books    | ❌      | ✅        |
| Manage users          | ❌      | ✅        |
| View fine summary     | Own     | All       |
| Waive fines           | ❌      | ✅        |

---

## 📐 Design System

- **Primary**: Deep Navy Blue `#1E3A5F`
- **Secondary**: Warm Gold `#F5A623`
- **Background**: Off-white `#F9F9F9`
- **Text**: Dark Charcoal `#2D2D2D`
- **Font**: Inter (Google Fonts)

---

## 📋 API Endpoints

| Method | Endpoint                  | Auth       | Description              |
|--------|---------------------------|------------|--------------------------|
| POST   | /api/auth/register        | Public     | Register new user        |
| POST   | /api/auth/login           | Public     | Login, returns JWT       |
| GET    | /api/auth/verify-email    | Public     | Email verification       |
| GET    | /api/books                | JWT        | List all books           |
| GET    | /api/books/search         | JWT        | Search books             |
| POST   | /api/books                | Librarian  | Add book                 |
| PUT    | /api/books/:id            | Librarian  | Update book              |
| DELETE | /api/books/:id            | Librarian  | Delete book              |
| POST   | /api/transactions/issue   | Librarian  | Issue book to student    |
| POST   | /api/transactions/return  | Librarian  | Return book              |
| GET    | /api/transactions/history | JWT        | View transaction history |
| GET    | /api/fines                | JWT        | View fines               |
| POST   | /api/fines/waive          | Librarian  | Waive a fine             |
| GET    | /api/admin/dashboard      | Librarian  | Dashboard stats          |
| GET    | /api/admin/users          | Librarian  | Manage users             |

---

## 🧪 Fine Calculation

- **Rate**: ₹2 per day after due date
- **Default loan period**: 14 days
- **Max borrow limit**: 3 books per student

---

## 📦 Deployment

See [Step 11 - Deployment Guide](docs/deployment.md) for full instructions.

- **Frontend**: Vercel
- **Backend**: Render or Railway
- **Database**: Supabase (PostgreSQL)
