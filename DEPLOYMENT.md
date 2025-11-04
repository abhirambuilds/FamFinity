# Deployment Guide

This guide explains how to deploy FamFinity to production using Render for the backend and Vercel for the frontend.

## Prerequisites

- GitHub repository with your code pushed
- Render account (free tier available)
- Vercel account (free tier available)
- Supabase account with your project set up

## Backend Deployment on Render

### Step 1: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### Step 2: Configure Service Settings

**Basic Settings:**
- **Name**: `famfinity-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

**OR use the render.yaml file:**
- Render will automatically detect `render.yaml` in your repository root
- This file contains all the configuration needed

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `GEMINI_API_KEY` - (Optional) Your Google Gemini API key
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

**Important**: Set `FRONTEND_URL` after you deploy the frontend to get the correct URL.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Wait for the deployment to complete (usually 5-10 minutes)
4. Note your backend URL (e.g., `https://famfinity-backend.onrender.com`)

## Frontend Deployment on Vercel

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your repository

### Step 2: Configure Project Settings

**Framework Preset**: Vite
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`

**OR** Vercel will auto-detect these settings from `vercel.json`

### Step 3: Set Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

- `VITE_API_URL` - Your Render backend URL (e.g., `https://famfinity-backend.onrender.com`)

**Important**: 
- Don't include trailing slash in the URL
- Make sure to add this for all environments (Production, Preview, Development)

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically build and deploy your frontend
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Note your frontend URL (e.g., `https://your-app.vercel.app`)

### Step 5: Update Backend CORS

After getting your Vercel frontend URL:

1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Render will automatically redeploy with the new CORS settings

## Post-Deployment Checklist

- [ ] Backend health check: Visit `https://your-backend.onrender.com/health`
- [ ] Frontend loads correctly: Visit your Vercel URL
- [ ] API connection: Test signup/login functionality
- [ ] CORS working: No CORS errors in browser console
- [ ] Environment variables: All set correctly in both platforms

## Troubleshooting

### Backend Issues

**Build fails:**
- Check that all dependencies are in `requirements.txt`
- Verify Python version (Render uses Python 3.8+ by default)
- Check build logs in Render dashboard

**Service crashes:**
- Check environment variables are set correctly
- Verify Supabase credentials
- Check application logs in Render dashboard

**CORS errors:**
- Ensure `FRONTEND_URL` is set in Render environment variables
- Verify the URL matches exactly (including https://)
- Restart the service after updating environment variables

### Frontend Issues

**Build fails:**
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel auto-detects)
- Check build logs in Vercel dashboard

**API connection fails:**
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that backend is running and accessible
- Verify CORS settings in backend

**404 errors on routes:**
- Vercel should handle this automatically with the `vercel.json` configuration
- Ensure `vercel.json` is in the repository root

## Environment Variables Summary

### Render (Backend)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key (optional)
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend.onrender.com
```

## Cost Considerations

### Render Free Tier
- 750 hours/month free
- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)

### Vercel Free Tier
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN

## Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Render automatically detects changes and redeploys
3. Monitor deployment in Render dashboard

### Frontend Updates
1. Push changes to GitHub
2. Vercel automatically detects changes and redeploys
3. Monitor deployment in Vercel dashboard

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

