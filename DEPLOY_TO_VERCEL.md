# Deploy React + Vite Frontend to Vercel (Monorepo Setup) - Complete Guide

## Project Overview

I have a **monorepo** project called **FamFinity** - a family finance management application. The backend is already deployed on Render, and I need help deploying the frontend to Vercel.

## Repository Information

- **Repository**: https://github.com/abhirambuilds/FamFinity
- **Branch**: `main`
- **Type**: Monorepo (frontend and backend in separate directories)

## Project Structure

```
FamFinity/
├── frontend/           # React + Vite frontend (needs Vercel deployment)
│   ├── src/           # React source files
│   ├── dist/          # Build output (generated, not in git)
│   ├── public/        # Static assets
│   ├── index.html     # HTML template
│   ├── vite.config.js # Vite configuration
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend (already deployed on Render)
│   ├── main.py
│   └── requirements-production-no-torch.txt
├── vercel.json        # Vercel configuration (at repo root)
├── render.yaml        # Backend deployment config (at repo root)
├── README.md
├── SECURITY.md
└── .gitignore
```

## Backend Status (Already Deployed)

✅ **Backend is already deployed and running on Render**
- **Platform**: Render.com
- **Status**: Live and working
- **Configuration**: Using `render.yaml` with Python 3.11.9
- **Backend URL**: Already configured and accessible
- **Environment Variables**: Already set up in Render dashboard

**Important**: The backend is working fine - focus only on **frontend deployment on Vercel**.

## Frontend Details

### Technology Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 7.1.9
- **Router**: React Router DOM 6.20.1
- **Styling**: Tailwind CSS 3.3.5
- **HTTP Client**: Axios 1.6.2
- **Database Client**: Supabase JS 2.75.0

### Frontend Configuration Files

#### `frontend/package.json`:
```json
{
  "name": "famfinity-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.75.0",
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^7.1.9"
  }
}
```

#### `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    host: true
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks: undefined
      }
    }
  }
})
```

### Local Build Verification

When I run `cd frontend && npm run build` locally, it correctly creates:
- `frontend/dist/index.html` with references to `/assets/index-[hash].js` and `/assets/index-[hash].css`
- `frontend/dist/assets/index-[hash].js`
- `frontend/dist/assets/index-[hash].css`

The built HTML does NOT reference `/src/main.jsx` - it correctly references the hashed assets.

## Vercel Configuration (Already Set Up)

✅ **`vercel.json` is correctly configured at repository root:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, max-age=0" }
      ]
    },
    {
      "source": "/",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, max-age=0" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Why this works:**
- ✅ **Monorepo build**: `@vercel/static-build` targets `frontend/package.json` and publishes `dist` → exactly what a Vite static app needs
- ✅ **SPA routing**: `filesystem` first, then catch-all to `/index.html` preserves client-side routes like `/dashboard` and `/login`
- ✅ **Headers**: HTML is no-cache; assets are immutable—perfect for preventing stale content
- ✅ **No changes required** - configuration is correct

## Step-by-Step Deployment Instructions

### 1. Create the Vercel Project

#### A. Import GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **`abhirambuilds/FamFinity`** from your GitHub repositories
5. Click **"Import"**

#### B. Configure Project Settings

**Root Directory:**
- ⚠️ **Leave EMPTY** (use repository root)
- This ensures Vercel sees `/vercel.json` at the root

**Framework Preset:**
- ⚠️ **Choose "Other"** (since the root isn't a framework; the build is defined by `vercel.json` and the `@vercel/static-build` builder)

**Build Settings:**
- **Build Command**: ⚠️ **Leave EMPTY**
- **Output Directory**: ⚠️ **Leave EMPTY**
- **Install Command**: ⚠️ **Leave EMPTY**
- Your `vercel.json` tells Vercel to build from `frontend/package.json` using `@vercel/static-build`, which will automatically run `npm install` and `npm run build` and publish `dist`

#### C. Add Environment Variable

Before deploying, add the environment variable:

1. In the project settings, scroll to **"Environment Variables"** section
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com` (replace with your actual Render backend URL)
   - ⚠️ **Important**: No trailing slash in the URL
   - **Environment**: Select **"Production"** and **"Preview"** (so preview deployments also work)

**Note**: Vite only exposes environment variables that start with `VITE_`, so this prefix is required.

#### D. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. After first deploy, go to **Project Settings** → **Git** and enable **"Automatic Git Deployments"** so pushes to `main` auto-deploy

### 2. Post-Deployment Verification

#### A. App Loads & Assets Work

1. Open your Vercel deployment URL (provided after deployment)
2. Open **Browser DevTools** (F12) → **Network** tab
3. Reload the page (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
4. Verify:
   - ✅ `index.html` loads with status 200
   - ✅ `/assets/index-[hash].js` loads with status 200
   - ✅ `/assets/index-[hash].css` loads with status 200
   - ✅ Check response headers:
     - `index.html` should have `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`
     - Assets should have `Cache-Control: public, max-age=31536000, immutable`

#### B. SPA Routes Work

1. Navigate to a client-side route (e.g., `/login` or `/dashboard`)
2. The page should load correctly
3. Hit **Refresh** (F5) while on that route
4. ✅ The page should still load (not show 404) - thanks to the catch-all route in `vercel.json`

#### C. Backend Connectivity

1. Open **Browser DevTools** → **Console** tab
2. Run this command (adjust path to any health/ping endpoint you have):
   ```javascript
   fetch(`${import.meta.env.VITE_API_URL}/health`).then(r => r.text()).then(console.log)
   ```
3. ✅ Should successfully connect to your backend
4. Alternatively, temporarily add a component that logs `import.meta.env.VITE_API_URL` to confirm the value at runtime

**Remember**: Only `VITE_` prefixed variables are exposed to the client.

#### D. CORS Configuration

If the browser blocks requests with CORS errors:
1. Go to your **Render Dashboard** → Backend Service → **Environment** tab
2. Ensure your backend's CORS settings allow your Vercel domain
3. The backend should have something like:
   ```python
   CORS_ORIGINS = ["https://your-app.vercel.app"]
   ```

### 3. Troubleshooting Common Issues

#### Issue: Build didn't run in `/frontend`

**Symptoms**: Build logs show errors or Vercel tried to auto-detect at repo root

**Fix**:
1. Check build logs for `@vercel/static-build`
2. Go to **Project Settings** → **Build & Output Settings**
3. Ensure:
   - Root Directory: **Empty**
   - Framework Preset: **Other**
   - Build/Output/Install Commands: **All Empty**
4. If you set a "Framework Preset" other than "Other" or overrode commands in the UI, reset to "Other" and clear UI commands so `vercel.json` is authoritative

#### Issue: 404 on refreshing deep links

**Symptoms**: Direct URL access to `/dashboard` shows 404

**Fix**:
- Ensure your catch-all route is **last** in `routes`: `{ "src": "/(.*)", "dest": "/index.html" }`
- ✅ You already have this - configuration is correct

#### Issue: Blank page / wrong asset paths

**Symptoms**: Page loads but shows blank or assets fail to load

**Fix**:
- In `vite.config.js`, you have `base: '/'` - ✅ correct for root deployments on Vercel
- If you ever deploy under a subpath, you'd need to change `base` in `vite.config.js`

#### Issue: Environment variable not available

**Symptoms**: `import.meta.env.VITE_API_URL` is undefined

**Fix**:
1. Confirm the variable exists in the same **Environment** (Preview vs Production)
2. **Important**: Vite bakes env vars at **build time**, so after changing `VITE_API_URL`, you **must redeploy**
3. Check **Project Settings** → **Environment Variables** → Ensure it's set for **Production** (and **Preview** if needed)

#### Issue: Caching confusion

**Symptoms**: HTML seems cached, showing old version

**Fix**:
- Your header rules target `/index.html` and `/` (✅ good)
- Confirm via response headers in DevTools
- Hard refresh (Ctrl+Shift+R) should bypass cache
- Check that `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` is in the response headers for HTML

### 4. Final Verification Checklist

Before considering deployment complete, verify:

- [ ] Root Directory left empty at import
- [ ] Framework = Other; no custom commands set in UI
- [ ] `vercel.json` exactly as shown (already in repo root) ✅
- [ ] `VITE_API_URL` set (Preview + Production)
- [ ] First deploy succeeds; `index.html` + hashed assets served
- [ ] Refresh on `/login` works (SPA fallback)
- [ ] API calls succeed from the deployed domain (CORS OK)
- [ ] Assets load with correct cache headers
- [ ] HTML never cached (for instant updates)

## Expected Build Output

After successful build, Vercel should serve:
- `/index.html` - The built HTML file (references hashed assets)
- `/assets/index-[hash].js` - Main JavaScript bundle
- `/assets/index-[hash].css` - CSS bundle
- `/assets/dashboard-preview-[hash].png` - Images (if any)
- Other static files from `public/` directory (e.g., `/logo-mark.svg`, `/manifest.json`)

All routes (like `/dashboard`, `/login`, `/signup`) should serve `/index.html` for client-side routing.

## Summary

Your configuration is **already correct**! You just need to:

1. ✅ Create new Vercel project
2. ✅ Set Root Directory = empty, Framework = Other
3. ✅ Leave all build commands empty
4. ✅ Add `VITE_API_URL` environment variable
5. ✅ Deploy and verify

The `vercel.json` at your repo root handles everything automatically. No code changes needed!
