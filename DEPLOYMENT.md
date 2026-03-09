# DLMS — Deployment Guide

## Stack

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend (Next.js) | **Vercel** | Free tier |
| Backend (Express) | **Railway** or **Render** | Free / $5/mo |
| Database (PostgreSQL) | **Supabase** or **Railway** | Free tier |
| Email | **Gmail App Password** | 500 emails/day free |

---

## 1. Database — Supabase

1. Go to https://supabase.com → New project
2. Note down:
   - **Connection string** (Project Settings → Database → Connection string → URI)
   - Replace `[YOUR-PASSWORD]` with your DB password
3. Set `DATABASE_URL` in your backend env to the Supabase URI

---

## 2. Backend — Railway

### Via GitHub

1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select `dlms` repo → choose `backend` directory (or set root dir to `/backend`)
4. Add all environment variables from `backend/.env.example` in Railway dashboard
5. Set **Start Command**: `npm start` (after build: `npm run build`)
6. Railway gives you a URL like `https://dlms-backend.up.railway.app`

### Via Render (alternative)

1. Go to https://render.com → New Web Service → Connect GitHub
2. Root directory: `backend`
3. Build command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`
5. Add environment variables in Render settings

After deployment, run the seed from Railway/Render shell:
```bash
npx ts-node prisma/seed.ts
```

---

## 3. Frontend — Vercel

1. Go to https://vercel.com → Import project from GitHub
2. Set **Root Directory**: `frontend`
3. Framework: **Next.js** (auto-detected)
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.up.railway.app/api
   ```
5. Deploy — Vercel gives you `https://dlms.vercel.app`

---

## 4. Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-api.railway.app/api/health`
- [ ] Login with demo credentials and test book search
- [ ] Issue and return a book to check fine calculation
- [ ] Check email: register a new student → verification email should arrive
- [ ] Update `FRONTEND_URL` in backend env to your Vercel URL (for email links)

---

## Environment Variables Summary

### Backend (Railway / Render)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...supabase.com/postgres
JWT_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<another random 64-char string>
FRONTEND_URL=https://dlms.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=DLMS Library <your.email@gmail.com>
FINE_PER_DAY=2
MAX_BORROW_LIMIT=3
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

---

## Generating a Secure Secret

```bash
# On Linux/Mac:
openssl rand -base64 64

# On Windows PowerShell:
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```
