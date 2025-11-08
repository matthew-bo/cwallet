# Quick Debug: 404 Error on Vercel

## Immediate Checks (Do these NOW)

### 1. Is the build still running?
```
Go to: Vercel Dashboard → Your Project → Deployments
Look for: "Building..." or "Deploying..."
```
**If YES:** Wait 2-3 more minutes, refresh the page.

### 2. Did the build fail?
```
Look for a RED X next to your deployment
Click on it to see error logs
```

**Common errors and fixes:**

#### "Prisma Client not generated"
**Fix:**
```bash
# In Vercel Dashboard → Settings → Build & Development Settings
# Set build command to:
prisma generate && next build
```

#### "Environment variable not found"
**Fix:** Missing environment variables
- Go to Settings → Environment Variables
- Add all required variables (see DEPLOYMENT-GUIDE.md)
- Redeploy

#### "Module not found" or "Cannot find module"
**Fix:**
```bash
# Locally, commit any missing dependencies:
npm install
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### 3. Is the deployment successful but 404?
```
Green checkmark but 404 page?
This usually means:
1. Environment variables are missing
2. Database connection failed
3. Route not found
```

**Quick test:**
```bash
# Test if API is working:
curl https://your-vercel-app.vercel.app/api/health
```

**If you get 404 on /api/health:**
- Build didn't include API routes
- Check build logs for errors

**If you get JSON response:**
- API works! Frontend might be the issue
- Try going to: https://your-vercel-app.vercel.app/dashboard

### 4. Check specific URL patterns

Try these URLs to narrow down the issue:

```bash
# Root page (should show sign-in)
https://your-vercel-app.vercel.app/

# Health check (should return JSON)
https://your-vercel-app.vercel.app/api/health

# Auth endpoint (should show NextAuth page or redirect)
https://your-vercel-app.vercel.app/api/auth/signin
```

## Emergency Fixes

### Fix 1: Force Redeploy
```bash
git commit --allow-empty -m "Force redeploy"
git push
```

### Fix 2: Clear Vercel Cache
```
Vercel Dashboard → Your Project → Settings → General
Scroll to "Clear Cache"
Click "Clear Cache" button
Then redeploy
```

### Fix 3: Check Function Logs
```
Vercel Dashboard → Your Project → Deployment → Functions
Click on any function
View real-time logs
Look for errors
```

## What to Send Me

If still having issues, send me:

1. **Build logs** (from Vercel dashboard)
2. **Error message** (exact text)
3. **URL** you're trying to access
4. **Screenshot** of the error page
5. **Environment variables list** (just the NAMES, not values)

Example:
```
URL: https://my-wallet-app.vercel.app/
Error: 404 - This page could not be found
Build Status: ✓ Successful
Environment Variables: DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET (missing GOOGLE_CLIENT_ID)
```

