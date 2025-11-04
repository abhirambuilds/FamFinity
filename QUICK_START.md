# 🚀 Quick Start - Deployment Guide

## 📖 Which Document to Follow?

**Follow this guide: `MOBILE_DEPLOYMENT_GUIDE.md`**

This is your complete step-by-step deployment guide for both Render and Vercel.

## 📋 Quick Overview

### Step 1: Deploy Backend (Render)
- Follow: `MOBILE_DEPLOYMENT_GUIDE.md` → **Step 1: Deploy Backend to Render**
- Time: ~10 minutes
- Use: **NO-TORCH version** (to avoid PyTorch issues)

### Step 2: Deploy Frontend (Vercel)
- Follow: `MOBILE_DEPLOYMENT_GUIDE.md` → **Step 2: Deploy Frontend to Vercel**
- Time: ~5 minutes

### Step 3: Connect Them
- Follow: `MOBILE_DEPLOYMENT_GUIDE.md` → **Step 3: Connect Backend and Frontend**
- Time: ~2 minutes

## 📚 All Documents Reference

### Main Guide (Follow This!)
- **`MOBILE_DEPLOYMENT_GUIDE.md`** - Complete deployment guide
  - ✅ Step-by-step for Render
  - ✅ Step-by-step for Vercel
  - ✅ Environment variables
  - ✅ Troubleshooting
  - ✅ Mobile & desktop support

### Quick References
- **`PYTORCH_FIX.md`** - Quick fix if PyTorch build fails
- **`FEATURE_CHECKLIST.md`** - Verify all features work
- **`DEPLOYMENT.md`** - Original detailed deployment guide (backup)

## ⚡ Quick Commands Reference

### Render (Backend)
**Build Command (NO-TORCH):**
```
pip install --upgrade pip && pip install -r requirements-production-no-torch.txt
```

**Start Command:**
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Vercel (Frontend)
**Build Command:**
```
cd frontend && npm install && npm run build
```

**Output Directory:**
```
frontend/dist
```

## 🔑 Environment Variables

### Render (Backend)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (optional)
- `FRONTEND_URL` (set after frontend deployment)

### Vercel (Frontend)
- `VITE_API_URL` (your Render backend URL)

## 🎯 Start Here!

1. Open `MOBILE_DEPLOYMENT_GUIDE.md`
2. Follow Step 1 (Render)
3. Follow Step 2 (Vercel)
4. Follow Step 3 (Connect)
5. Done! 🎉

## 💡 Pro Tip

If you get stuck:
- Check the **Troubleshooting** section in `MOBILE_DEPLOYMENT_GUIDE.md`
- For PyTorch issues, see `PYTORCH_FIX.md`
- For feature verification, see `FEATURE_CHECKLIST.md`

