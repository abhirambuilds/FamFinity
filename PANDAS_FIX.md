# 🔧 Quick Fix: Pandas Build Error on Render

## Problem
Render deployment fails with pandas compilation error:
```
error: metadata-generation-failed
× Encountered error while generating package metadata.
╰─> pandas
```

## Solution (2 Options)

### Option 1: Update Build Command in Render Dashboard (Recommended)

1. Go to Render dashboard → Your Service → Settings
2. Find **Build Command**
3. Replace it with:
   ```
   pip install --upgrade pip setuptools wheel && pip install --only-binary=:all: numpy==1.24.3 pandas==2.0.3 && pip install -r requirements-production-no-torch.txt
   ```
4. Click **Save Changes**
5. Click **Manual Deploy** → **Deploy latest commit**

### Option 2: Use Updated Files (If Using render.yaml)

The files have been updated:
- `requirements-production-no-torch.txt` - Pinned pandas/numpy versions
- `render-no-torch.yaml` - Updated build command

Just push to GitHub and Render will auto-deploy.

## Why This Works

1. **Pinned versions**: Uses specific pandas/numpy versions with pre-built wheels
2. **--only-binary**: Forces pip to use pre-built wheels (no compilation)
3. **Install order**: Installs numpy and pandas first (as wheels), then other packages

## Alternative: Use Lighter Versions

If still failing, try even lighter versions in Build Command:
```
pip install --upgrade pip setuptools wheel && pip install --only-binary=:all: numpy==1.23.5 pandas==1.5.3 && pip install -r requirements-production-no-torch.txt
```

## Verification

After deployment, check logs for:
- ✅ "Successfully installed numpy-1.24.3"
- ✅ "Successfully installed pandas-2.0.3"
- ✅ No compilation errors

## Need Help?

If still failing, check:
1. Python version (should be 3.8+)
2. Build logs for specific error messages
3. Try the alternative lighter versions above

