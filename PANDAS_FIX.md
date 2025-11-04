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
   pip install --upgrade pip setuptools wheel && pip install -r requirements-production-no-torch.txt
   ```
4. Click **Save Changes**
5. Click **Manual Deploy** → **Deploy latest commit**

### Option 2: Use Updated Files (If Using render.yaml)

The files have been updated:
- `requirements-production-no-torch.txt` - Pinned pandas/numpy versions
- `render-no-torch.yaml` - Updated build command

Just push to GitHub and Render will auto-deploy.

## Why This Works

1. **Compatible versions**: Uses numpy/pandas versions compatible with Render's Python version
2. **Pre-built wheels**: Requirements file specifies versions with available wheels
3. **Simple install**: Direct installation without forcing binary-only (pip will use wheels when available)

## Alternative: If Still Failing

If you see version conflicts, check Render's Python version:
1. Go to Settings → Environment
2. Check Python version (should be 3.8-3.12)
3. If Python 3.13+, you may need to specify Python 3.12 in render.yaml:
   ```yaml
   env: python
   pythonVersion: "3.12"
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

