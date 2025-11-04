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

**Root Directory**: 
- Set to `backend` (this tells Render where your backend code is located)

**Basic Settings (if not using render.yaml):**
- **Name**: `famfinity-backend`
- **Environment**: `Python 3`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Using render.yaml (Recommended):**
- Render will automatically detect `render.yaml` in your repository root
- This file contains all the configuration needed
- **Root Directory**: Set to `backend` (or leave empty if using render.yaml which specifies `rootDir: backend`)
- The `render.yaml` file already specifies:
  - Root directory: `backend`
  - Build command: `pip install --upgrade pip && pip install -r requirements-production.txt && pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - Environment variables (you'll still need to set their values)
- **Note**: PyTorch is installed using CPU-only pre-built wheels from PyTorch's official repository. This avoids compilation issues and is lighter (~500MB vs ~2GB+). LSTM predictions will work fully.

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

**Required Variables:**
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (found in Supabase Dashboard → Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (found in Supabase Dashboard → Settings → API)

**Optional Variables:**
- `GEMINI_API_KEY` - Your Google Gemini API key (required for AI features)
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

**Important Notes:**
- Set `FRONTEND_URL` after you deploy the frontend to get the correct URL
- Make sure there are no trailing slashes in URLs
- All environment variables are case-sensitive
- You can set variables individually or use the sync feature from `render.yaml`

### Step 4: Deploy

1. Click **"Create Web Service"** (or **"Apply"** if using render.yaml)
2. Render will automatically:
   - Clone your repository
   - Install Python dependencies from `backend/requirements-production.txt`
   - Install CPU-only PyTorch (for LSTM predictions) using pre-built wheels
   - Build your application
   - Start the FastAPI server
3. Wait for the deployment to complete (usually 5-10 minutes for first deployment)
4. Monitor the build logs for any errors
5. Once deployed, note your backend URL (e.g., `https://famfinity-backend.onrender.com`)
6. Test the health endpoint: `https://your-backend.onrender.com/health`

**Deployment Status:**
- ✅ **Live**: Service is running and accessible
- ⏳ **Building**: Still installing dependencies or building
- ❌ **Failed**: Check build logs for errors

## Frontend Deployment on Vercel

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your repository

### Step 2: Configure Project Settings

**You have two options for Root Directory:**

#### Option 1: Root Directory = `./` (Repository Root) - **Recommended if fields are locked**

**Root Directory**: `./` or leave empty (repository root)
- This tells Vercel to use the repository root
- Commands need to include `cd frontend` or `frontend/` prefixes

**Framework Preset**: Vite (auto-detected)
**Build Command**: `cd frontend && npm install && npm run build`
**Output Directory**: `frontend/dist`
**Install Command**: `cd frontend && npm install`

**Using vercel.json (Recommended):**
- Vercel will automatically use `vercel.json` from your repository root
- The `vercel.json` file already specifies the correct commands for root directory setup:
  - Build command: `cd frontend && npm install && npm run build`
  - Output directory: `frontend/dist`
  - Install command: `cd frontend && npm install`
- **Root Directory**: Set to `./` or leave empty in Vercel dashboard

#### Option 2: Root Directory = `frontend`

**Root Directory**: `frontend`
- This tells Vercel where your frontend code is located
- When root directory is set to `frontend`, Vercel operates from within that directory
- **Do NOT** include `cd frontend` or `frontend/` prefixes in commands

**Framework Preset**: Vite (auto-detected)
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

**If using this option, remove build/install commands from vercel.json** (keep only framework and rewrites)

**Note**: Make sure `vercel.json` is in your repository root (not in the frontend folder)

### Step 3: Set Environment Variables

#### Local Development (.env file)

Create a `.env` file in the `frontend/` directory with:

```env
# API Base URL - Backend server URL
# For local development: http://localhost:8000
VITE_API_URL=http://localhost:8000
```

**Important Notes:**
- Vite requires the `VITE_` prefix for environment variables to be exposed to the frontend
- Never commit `.env` files to git (add to `.gitignore`)
- The `.env` file should be in the `frontend/` directory (not root)

#### Production (Vercel Dashboard)

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

### Backend Verification
- [ ] Backend health check: Visit `https://your-backend.onrender.com/health` - should return `{"status": "healthy"}`
- [ ] API docs accessible: Visit `https://your-backend.onrender.com/docs` - should show Swagger UI
- [ ] Environment variables: All required variables set in Render dashboard
- [ ] Build logs: No errors in Render deployment logs
- [ ] Service status: Shows "Live" in Render dashboard

### Frontend Verification
- [ ] Frontend loads correctly: Visit your Vercel URL
- [ ] No console errors: Check browser developer console
- [ ] Environment variables: `VITE_API_URL` set correctly in Vercel
- [ ] Build logs: No errors in Vercel deployment logs

### Integration Testing
- [ ] API connection: Test signup/login functionality from frontend
- [ ] CORS working: No CORS errors in browser console
- [ ] Data persistence: Create account, verify data saves to Supabase
- [ ] All routes working: Navigate through all pages without 404 errors

### Database Verification
- [ ] Supabase connection: Backend can connect to Supabase
- [ ] Tables exist: Verify all required tables are created in Supabase
- [ ] Row Level Security (RLS): Policies are enabled and working correctly

## Troubleshooting

### Backend Issues

**Build fails:**
- **PyTorch build errors**: The `render.yaml` uses CPU-only PyTorch wheels which should install without compilation. If you still get errors:
  - Check that the build command includes the `--index-url https://download.pytorch.org/whl/cpu` flag
  - Try using `requirements-production-no-torch.txt` as a fallback (LSTM features will use baseline models instead)
  - Verify Python version (Render uses Python 3.8+ by default)
- **Metadata generation errors**: Usually caused by large ML packages. The production setup uses CPU-only PyTorch pre-built wheels to avoid this
- Check that all dependencies are in the requirements file you're using
- Check build logs in Render dashboard for specific error messages
- **If still failing**: Temporarily switch to `requirements-production-no-torch.txt` in `render.yaml` to isolate the issue

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
- Ensure `vercel.json` is in the repository root (not in frontend folder)
- Verify the `rewrites` configuration in `vercel.json` is correct
- Check that React Router is configured correctly in your app

**Environment variables not working:**
- Vercel environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Rebuild the deployment after adding/changing environment variables
- Verify variables are set for the correct environment (Production/Preview/Development)

## Environment Variables Summary

### Frontend Environment Variables

#### Local Development (`.env` file in `frontend/` directory)
```env
# Required: Backend API URL
VITE_API_URL=http://localhost:8000
```

#### Production (Vercel Dashboard)
```env
# Required: Backend API URL (your Render backend URL)
VITE_API_URL=https://your-backend.onrender.com
```

**Frontend Notes:**
- Only **ONE** environment variable is needed: `VITE_API_URL`
- Vite requires the `VITE_` prefix for variables to be accessible in the frontend code
- The variable is used in `frontend/src/api/index.js` to set the API base URL
- If not set, it defaults to `http://localhost:8000` (for local development)

### Backend Environment Variables (Render)

```env
# Required: Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Optional: AI Features
GEMINI_API_KEY=your_gemini_key

# Required after frontend deployment: CORS Configuration
FRONTEND_URL=https://your-app.vercel.app
```

## Cost Considerations

### Render Free Tier
- **750 hours/month** free (enough for one service running 24/7)
- **Service spins down** after 15 minutes of inactivity
- **Cold start**: First request after spin-down may take 30-60 seconds
- **Auto-deploy**: Automatically deploys on git push
- **HTTPS**: Automatic SSL certificates
- **Custom domains**: Supported on free tier

**Render Paid Tier** (if needed):
- Starts at $7/month per service
- No spin-down, always available
- Faster cold starts
- Better performance

### Vercel Free Tier
- **Unlimited deployments** and previews
- **100GB bandwidth/month**
- **Automatic HTTPS** and SSL
- **Global CDN** for fast loading
- **Custom domains** supported
- **Analytics**: Basic analytics included

### Supabase Free Tier
- **500MB database** storage
- **2GB bandwidth/month**
- **50,000 monthly active users**
- **2GB file storage**
- **Unlimited API requests** (within rate limits)

## Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Render automatically detects changes and redeploys
3. Monitor deployment in Render dashboard

### Frontend Updates
1. Push changes to GitHub
2. Vercel automatically detects changes and redeploys
3. Monitor deployment in Vercel dashboard

## Database Setup on Supabase

Before deploying, ensure your Supabase database is properly set up:

### Step 1: Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Run the following SQL files in order:
   - `backend/db/legacy_migrations/001_init.sql` - Creates initial tables
   - `backend/db/002_add_budgets_expenses.sql` - Adds budgets and expenses tables
   - `backend/db/003_complete_schema.sql` - Completes the schema

### Step 2: Enable Row Level Security (RLS)

1. Go to Supabase Dashboard → Authentication → Policies
2. Run `backend/db/supabase_policies.sql` to set up RLS policies
3. Verify that RLS is enabled on all tables

### Step 3: Verify Setup

1. Check that all tables exist:
   - `users`
   - `user_profiles`
   - `onboarding_responses`
   - `budgets`
   - `expenses`
   - `goals`
   - `investments`

2. Test database connection from backend using your Supabase credentials

## Custom Domain Setup

### Render (Backend)
1. In Render dashboard, go to your service settings
2. Click **"Custom Domains"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

### Vercel (Frontend)
1. In Vercel dashboard, go to your project settings
2. Click **"Domains"**
3. Add your domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
4. Configure DNS records as instructed
5. SSL certificate will be automatically provisioned

## Monitoring and Logs

### Render Logs
- Access logs from Render dashboard → Your Service → Logs
- Real-time logs available during deployment
- Historical logs stored for debugging

### Vercel Logs
- Access logs from Vercel dashboard → Your Project → Deployments → View Function Logs
- Real-time logs during deployment
- Analytics dashboard available for performance metrics

### Health Monitoring
- Set up health check monitoring for backend: `https://your-backend.onrender.com/health`
- Monitor response times and uptime
- Set up alerts for service downtime

## Rollback Procedure

### Render Rollback
1. Go to Render dashboard → Your Service → Manual Deploy
2. Click on a previous successful deployment
3. Select **"Redeploy this commit"**
4. Service will roll back to that version

### Vercel Rollback
1. Go to Vercel dashboard → Your Project → Deployments
2. Find the deployment you want to roll back to
3. Click the **"..."** menu → **"Promote to Production"**
4. Frontend will roll back to that version

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **CORS**: Only allow your frontend domain in CORS settings
3. **API Keys**: Rotate API keys regularly
4. **Database**: Use RLS policies in Supabase
5. **HTTPS**: Always use HTTPS in production (automatic on Render/Vercel)
6. **Dependencies**: Keep dependencies updated for security patches

## Performance Optimization

### Backend
- Use connection pooling for database connections
- Enable caching where appropriate
- Optimize database queries
- Consider upgrading Render plan for better performance

### Frontend
- Enable Vercel's automatic image optimization
- Use code splitting for better load times
- Minimize bundle size
- Leverage CDN caching

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Render render.yaml Reference](https://render.com/docs/yaml-spec)

