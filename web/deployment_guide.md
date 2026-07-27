# 🚀 PricePulse 24/7 Cloud Deployment Guide

Running PricePulse 24/7 on the cloud ensures your app stays online, installable on mobile devices, and running continuous price syncs **even when your laptop is powered off**.

---

## 1. Frontend Web App (Next.js 14 + PWA)

### Host on Vercel (100% Free)
[Vercel](https://vercel.com) is the zero-config cloud platform built by the creators of Next.js.

#### Step 1: Deploy using Vercel CLI
Run the following commands in your terminal inside `c:/Users/rihaa/OneDrive/Desktop/all rounder/web`:

```bash
# 1. Login or create free Vercel account
npx vercel login

# 2. Deploy directly to production
npx vercel --prod
```

#### Step 2: Set Environment Variables in Vercel Dashboard
In your Vercel Project Settings > **Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

#### Step 3: Result
You will get a live 24/7 SSL URL like:  
`https://pricepulse.vercel.app`

---

## 2. Database & Vector Engine

### Host on Supabase (100% Free Tier)
[Supabase](https://supabase.com) provides hosted PostgreSQL with `pgvector` enabled out of the box.

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and paste the migration SQL from `supabase/migrations/20260727000000_initial_schema.sql`.
3. Hit **Run** to provision all 5 production tables.

---

## 3. Hourly Ingestion Worker & Redis

### Redis: Upstash Redis (100% Free Serverless Redis)
1. Sign up at [upstash.com](https://upstash.com).
2. Create a Redis database.
3. Copy the `REDIS_URL` string into your environment variables.

### Worker Node: Render / Railway (24/7 Cloud Node Worker)
1. Link your GitHub repo to [Render](https://render.com) or [Railway](https://railway.app).
2. Root Directory: `worker/`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add `REDIS_URL` environment variable.

---

## Summary Stack for 24/7 Operation

| Component | Cloud Provider | Cost | Status |
|-----------|----------------|------|--------|
| **Web & Mobile PWA** | Vercel | Free | 24/7 Live |
| **Database & Vector** | Supabase | Free | 24/7 Live |
| **Redis Cache** | Upstash | Free | 24/7 Live |
| **Hourly Scraper Worker** | Render / Railway | Free | 24/7 Live |
