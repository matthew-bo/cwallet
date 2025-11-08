# Vercel Deployment Guide

## Current Status: Deployed to Vercel ✅

## Troubleshooting 404 Error

If you're seeing a 404 error, try these steps in order:

### 1. Check Vercel Dashboard
- Go to https://vercel.com/dashboard
- Find your project
- Click on it to see the deployment status
- Look at the "Deployments" tab

### 2. Check Build Status
**Is the build successful?**
- Green checkmark = Good
- Red X = Build failed - click to see logs

**Common build failures:**
- Missing environment variables
- Prisma generation failed
- TypeScript errors

### 3. Check the Build Logs
In Vercel dashboard → Your Project → Latest Deployment → View Function Logs

**Look for:**
```
✓ Generating Prisma Client
✓ Compiled successfully
```

### 4. Verify Environment Variables
In Vercel dashboard → Your Project → Settings → Environment Variables

**Required variables (must ALL be set):**

```bash
# Database (CRITICAL)
DATABASE_URL=postgresql://...

# Redis (CRITICAL)
REDIS_URL=redis://...

# NextAuth (CRITICAL)
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth (CRITICAL)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Cloud KMS (CRITICAL)
GOOGLE_KMS_PROJECT=crypto-wallet-gpt
GOOGLE_KMS_KEYRING=wallet-keyring
GOOGLE_KMS_KEY=wallet-key
GOOGLE_APPLICATION_CREDENTIALS_JSON=<entire JSON as one line>

# Encryption (CRITICAL)
APP_ENCRYPTION_KEY=<64 hex characters>

# Blockchain (CRITICAL)
INFURA_PROJECT_ID=your-infura-project-id
ETHEREUM_NETWORK=sepolia
```

### 5. Common Issues and Solutions

#### Issue: "404 - This page could not be found"
**Possible causes:**
1. Build is still in progress (wait 2-3 minutes)
2. Build failed (check build logs)
3. Missing environment variables (check settings)

**Solution:**
```bash
# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Redeploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

#### Issue: "Internal Server Error" or API routes returning 500
**Cause:** Missing or incorrect environment variables

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Double-check each variable
3. Make sure GOOGLE_APPLICATION_CREDENTIALS_JSON is valid JSON (use a JSON validator)
4. Redeploy after fixing

#### Issue: Database connection failed
**Cause:** DATABASE_URL is incorrect or database is not accessible

**Solution:**
1. Check if DATABASE_URL includes `?sslmode=require`
2. Verify the database is running in DigitalOcean
3. Check if Vercel's IP is allowed to connect
4. Test connection locally first

#### Issue: OAuth callback error
**Cause:** Google OAuth redirect URI not updated

**Solution:**
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Edit OAuth 2.0 Client
4. Add authorized redirect URI:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/google
   ```
5. Save and wait 5 minutes for propagation

### 6. Verify Deployment is Working

Once the site loads, test these endpoints:

#### Health Check
```bash
curl https://your-vercel-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-07T...",
  "database": "connected",
  "redis": "connected",
  "kms": "connected",
  "blockchain": "connected"
}
```

#### Landing Page
Open in browser:
```
https://your-vercel-app.vercel.app
```

Should see the "Sign in with Google" button.

### 7. Next Steps After Deployment Works

1. **Test OAuth Flow:**
   - Click "Sign in with Google"
   - Grant permissions
   - Should redirect back to dashboard

2. **Verify Wallet Creation:**
   - After signing in, wallet should auto-create
   - Check dashboard shows wallet address

3. **Test API Endpoints:**
   ```bash
   # Get your session token from browser cookies
   # Then test:
   curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
     https://your-vercel-app.vercel.app/api/wallet/balance
   ```

## Environment Variables Setup Checklist

Copy this checklist for setting up Vercel environment variables:

- [ ] DATABASE_URL (from DigitalOcean PostgreSQL)
- [ ] REDIS_URL (from DigitalOcean Redis)
- [ ] NEXTAUTH_URL (https://your-project.vercel.app)
- [ ] NEXTAUTH_SECRET (generate new: `openssl rand -base64 32`)
- [ ] GOOGLE_CLIENT_ID (from Google Cloud Console)
- [ ] GOOGLE_CLIENT_SECRET (from Google Cloud Console)
- [ ] GOOGLE_KMS_PROJECT (crypto-wallet-gpt)
- [ ] GOOGLE_KMS_KEYRING (wallet-keyring)
- [ ] GOOGLE_KMS_KEY (wallet-key)
- [ ] GOOGLE_APPLICATION_CREDENTIALS_JSON (entire JSON as single line, no newlines)
- [ ] APP_ENCRYPTION_KEY (64 hex chars: `openssl rand -hex 32`)
- [ ] INFURA_PROJECT_ID (from Infura dashboard)
- [ ] ETHEREUM_NETWORK (sepolia for testing, mainnet for production)

## Getting Your Vercel URL

After deployment, your URL will be:
```
https://<project-name>.vercel.app
```

Or if you set a custom name:
```
https://<custom-name>.vercel.app
```

## Updating Google OAuth Redirect URIs

**CRITICAL:** After getting your Vercel URL, update Google OAuth settings:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/google
   ```
4. Click "Save"
5. **Wait 5-10 minutes** for changes to propagate

## Manual Deployment Commands

If you need to deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd crypto-wallet-gpt
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Rollback Instructions

If something goes wrong:

```bash
# List previous deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

## Contact Support

If issues persist:
1. Check Vercel status page: https://www.vercel-status.com/
2. Vercel support: https://vercel.com/support
3. Check build logs in Vercel dashboard for specific errors

