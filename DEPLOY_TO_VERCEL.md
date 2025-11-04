# Help: Deploy React + Vite Frontend to Vercel (Monorepo Setup)

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

**Important**: The backend is working fine - I only need help with **frontend deployment on Vercel**.

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

#### `frontend/index.html` (source template):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo-mark.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
    <meta name="theme-color" content="#6246e9" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="FamFinity" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="description" content="The only app that gets your money into shape. Manage family finances with smart insights and beautiful analytics." />
    <title>FamFinity - Get Your Money Into Shape</title>
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/logo-mark.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Local Build Verification

When I run `cd frontend && npm run build` locally, it correctly creates:
- `frontend/dist/index.html` with references to `/assets/index-[hash].js` and `/assets/index-[hash].css`
- `frontend/dist/assets/index-[hash].js`
- `frontend/dist/assets/index-[hash].css`

The built HTML does NOT reference `/src/main.jsx` - it correctly references the hashed assets.

## Current Vercel Configuration

I have a `vercel.json` file at the repository root:

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

This configuration:
- Uses `@vercel/static-build` to build from `frontend/package.json`
- Builds output to `frontend/dist/` (relative to frontend directory)
- Serves static files via filesystem handler
- Falls back to `/index.html` for SPA routing
- Sets proper cache headers (HTML not cached, assets immutable)

## Environment Variables Needed

The frontend needs this environment variable:
- **`VITE_API_URL`**: The backend API URL from Render (e.g., `https://your-backend.onrender.com`)
  - **Important**: Must have `VITE_` prefix (Vite requirement)
  - **No trailing slash** in the URL

This will be set in Vercel dashboard after project creation.

## What I Need Help With

I want to deploy the frontend to **Vercel** using the existing `vercel.json` configuration. I'm starting fresh with a new Vercel project.

### Specific Questions:

1. **Project Creation Settings**:
   - What settings should I configure when creating a new Vercel project?
   - Should Root Directory be empty (repo root) or set to `frontend`?
   - What should Framework Preset be?
   - Should Build Command, Output Directory, and Install Command be empty (since `vercel.json` handles it)?

2. **Configuration Verification**:
   - Is my current `vercel.json` configuration correct for this monorepo setup?
   - Do I need to modify anything in `vercel.json`?
   - Are the routes and headers configured correctly?

3. **Deployment Process**:
   - Step-by-step instructions for creating a new Vercel project
   - How to connect it to my GitHub repository
   - What settings to configure during project setup
   - How to set the `VITE_API_URL` environment variable

4. **Verification**:
   - How to verify the deployment is working correctly
   - What to check if there are issues
   - How to test the connection to the backend

## Requirements

- ✅ Must work with Root Directory = empty (repository root) so `vercel.json` at root is detected
- ✅ Must maintain SPA routing (all routes serve `index.html`)
- ✅ Must serve built assets from `frontend/dist/assets/`
- ✅ Must connect to backend API via `VITE_API_URL` environment variable
- ✅ Frontend code must remain in `frontend/` subdirectory (cannot change structure)

## Expected Build Output

After successful build, Vercel should serve:
- `/index.html` - The built HTML file (references hashed assets)
- `/assets/index-[hash].js` - Main JavaScript bundle
- `/assets/index-[hash].css` - CSS bundle
- `/assets/dashboard-preview-[hash].png` - Images
- Other static files from `public/` directory

All routes (like `/dashboard`, `/login`) should serve `/index.html` for client-side routing.

## What I Need

Please provide:

1. **Step-by-step guide** for creating a new Vercel project with the correct settings
2. **Configuration verification** - confirm my `vercel.json` is correct
3. **Environment variable setup** - how to configure `VITE_API_URL` in Vercel
4. **Troubleshooting tips** - what to check if deployment doesn't work
5. **Verification checklist** - how to confirm everything is working

Thank you for your help!
