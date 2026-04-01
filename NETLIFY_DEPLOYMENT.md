# 🚀 Netlify Deployment Guide

This guide will help you deploy the Task Management System to Netlify with a PostgreSQL database.

## Prerequisites

- GitHub account with the repository pushed
- Netlify account (free tier works)
- Neon account for PostgreSQL database (free tier)

---

## Step 1: Create PostgreSQL Database (Neon)

### 1.1 Sign Up for Neon
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" → Sign in with GitHub
3. Create a new project:
   - **Name**: `task-management`
   - **Region**: Choose closest to your users

### 1.2 Get Connection String
1. After project creation, go to **Dashboard**
2. Copy the **Connection string** (starts with `postgresql://...`)
3. Save it - you'll need it for Netlify

### 1.3 Initialize Database
1. In Neon Dashboard, click **SQL Editor**
2. Copy the contents of `netlify/functions/prisma/seed.sql`
3. Paste and run in the SQL Editor
4. This creates: roles, permissions, users, and sample tasks

---

## Step 2: Deploy to Netlify

### 2.1 Connect Repository
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** → Authorize → Choose your repository

### 2.2 Configure Build Settings
Netlify should auto-detect settings from `netlify.toml`, but verify:

| Setting | Value |
|---------|-------|
| **Base directory** | *(leave empty)* |
| **Build command** | `npm run build:netlify` |
| **Publish directory** | `frontend/dist` |
| **Functions directory** | `netlify/functions` |

### 2.3 Set Environment Variables
Click **"Site settings"** → **"Environment variables"** → **"Add a variable"**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Any secure random string (32+ chars) |
| `JWT_EXPIRES_IN` | `7d` |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (2-5 minutes)
3. Your site is live at `https://your-site-name.netlify.app`

---

## Step 3: Test Your Deployment

### 3.1 Check Health Endpoint
```
https://your-site.netlify.app/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 3.2 Test Login
1. Open your Netlify URL
2. Login with demo credentials:
   - **Admin**: `admin@admin.com` / `admin123`
   - **Manager**: `manager@example.com` / `manager123`
   - **User**: `user@example.com` / `user123`

---

## Troubleshooting

### Build Fails
- Check **Deploys** → Click failed deploy → **View log**
- Common issues:
  - Missing `DATABASE_URL` environment variable
  - npm install errors (try clearing cache)

### API Returns 500 Errors
- Check **Functions** → **api** → **View logs**
- Usually caused by:
  - Invalid `DATABASE_URL`
  - Database not initialized (run seed.sql)

### "Cannot connect to database"
- Verify your Neon connection string
- Make sure the database is not paused (Neon pauses after inactivity)

### CORS Errors
- The API is configured to allow all origins
- If issues persist, check browser console for details

---

## Updating Your Deployment

### Code Changes
1. Push changes to GitHub
2. Netlify auto-deploys on push to main branch

### Database Schema Changes
1. Update `netlify/functions/prisma/schema.prisma`
2. Run migrations in Neon SQL Editor manually
3. Push changes → Netlify rebuilds

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NETLIFY                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐    ┌─────────────────────┐   │
│  │   Static Files       │    │  Netlify Functions  │   │
│  │   (frontend/dist)    │    │  (api.ts)           │   │
│  │                      │    │                     │   │
│  │  React SPA           │───▶│  Express Server     │   │
│  │  - Login Page        │    │  - /api/auth/*      │   │
│  │  - Dashboard         │    │  - /api/tasks/*     │   │
│  │  - Task Management   │    │  - /api/users/*     │   │
│  └──────────────────────┘    └──────────┬──────────┘   │
│                                         │               │
└─────────────────────────────────────────┼───────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │     NEON POSTGRES     │
                              │                       │
                              │  - users table        │
                              │  - roles table        │
                              │  - permissions table  │
                              │  - tasks table        │
                              └───────────────────────┘
```

---

## Cost Estimate (Free Tier)

| Service | Free Tier Limits |
|---------|-----------------|
| **Netlify** | 100GB bandwidth, 300 build minutes/month |
| **Neon** | 0.5 GB storage, 191 compute hours/month |

**Note**: Both services auto-pause when inactive, perfect for demo projects!

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.com | admin123 |
| Manager | manager@example.com | manager123 |
| User | user@example.com | user123 |

---

## Support

- **Repository**: https://github.com/SauravDnj/Task-Management-System
- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
