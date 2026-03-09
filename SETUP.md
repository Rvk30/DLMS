# DLMS — Local Setup Guide

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://postgresql.org |
| Git | any | https://git-scm.com |

---

## Step 1 — Clone and Install Dependencies

```bash
# Clone the repo
git clone <your-repo-url>
cd dlms

# Install all workspace dependencies (root, backend, frontend)
npm run install:all
```

If `install:all` is not set up yet, run manually:
```bash
cd backend  && npm install
cd ../frontend && npm install
cd ..
```

---

## Step 2 — Configure Environment Variables

### Backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in these values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dlms?schema=public"
JWT_SECRET=any_long_random_secret_key_32_chars_min
JWT_REFRESH_SECRET=another_different_long_secret_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_gmail_app_password    # NOT your Gmail password
                                     # See: https://myaccount.google.com/apppasswords
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# .env.local already contains the right value for local dev:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Step 3 — Set Up the Database

> **Tip:** Create the database first if it does not exist.

```sql
-- In psql:
CREATE DATABASE dlms;
```

Then from the `backend/` directory:

```bash
# Generate the Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with sample data (1 librarian, 2 students, 8 books)
npx ts-node prisma/seed.ts
```

After seeding you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Librarian | `librarian@dlms.edu` | `Librarian@123` |
| Student | `arjun.kumar@dlms.edu` | `Student@123` |
| Student | `priya.sharma@dlms.edu` | `Student@123` |

---

## Step 4 — Start the Development Servers

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

---

## Useful Dev Commands

| Command | Description |
|---------|-------------|
| `npx prisma studio` | Visual DB browser at http://localhost:5555 |
| `npx prisma migrate reset` | Reset + re-seed the database |
| `npx prisma db push` | Push schema changes without migration file |
| `npm run db:seed` | Re-run seed (from backend/) |

---

## Project Structure (Quick Reference)

```
dlms/
├── backend/
│   ├── prisma/              # Schema + seed
│   └── src/
│       ├── config/          # DB + mailer config
│       ├── controllers/     # Thin HTTP handlers
│       ├── middleware/      # Auth, error, validation
│       ├── routes/          # Express routers
│       ├── services/        # Business logic
│       ├── types/           # Shared TS types
│       └── utils/           # AppError, JWT, email templates, scheduler
└── frontend/
    └── src/
        ├── app/             # Next.js App Router pages
        ├── components/      # Shared UI (Sidebar, AppShell)
        ├── hooks/           # Auth guard hooks
        ├── lib/             # Axios API client
        └── store/           # Zustand auth store
```
