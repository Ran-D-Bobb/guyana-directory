# Deployment Guide

This guide walks you through deploying the Guyana Directory app to Vercel with a production Supabase instance.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Supabase account (sign up at https://supabase.com)
- Google Cloud Console project (for OAuth)

## Step 1: Create Production Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: guyana-directory (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click "Create new project" (wait ~2 minutes for setup)

## Step 2: Link Local Supabase to Production

Once your project is created:

```bash
# Login to Supabase CLI
supabase login

# Link to your production project
# You'll be prompted to select your project from a list
supabase link

# Alternative: Link using project reference
# Get project ref from project settings URL: https://app.supabase.com/project/[PROJECT_REF]
supabase link --project-ref your-project-ref
```

## Step 3: Push Database Schema to Production

```bash
# Push all migrations to production
supabase db push

# Verify migrations were applied
supabase db diff
```

If you see any differences, you may need to reset and push again:
```bash
supabase db reset --linked
```

## Step 4: Get Production Environment Variables

1. Go to your Supabase project: https://app.supabase.com/project/[PROJECT_REF]
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Step 5: Configure Google OAuth for Production

### Update Google OAuth Redirect URIs

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
4. Click **Save**

### Configure Supabase Auth

1. In your Supabase project, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Enter your:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. Add authorized redirect URLs:
   - For Vercel preview: `https://*.vercel.app/**`
   - For production domain (if you have one): `https://yourdomain.com/**`
5. Click **Save**

### Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL:
   - Development: `https://your-app.vercel.app`
   - Production: `https://yourdomain.com` (if you have a custom domain)
3. Add **Redirect URLs** (one per line):
   ```
   https://your-app.vercel.app/**
   http://localhost:3000/**
   ```

## Step 6: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: guyana-directory
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository (GitHub/GitLab/Bitbucket)
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Add Environment Variables in Vercel

After creating the project, add these environment variables:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these variables (for Production, Preview, and Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
ADMIN_EMAILS=admin@waypoint.gy,hollowsn3@gmail.com,cecilabrams25@gmail.com,isoke.britton@gmail.com
```

3. Click **Save**
4. Redeploy your application for changes to take effect

## Step 7: Verify Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test key functionality:
   - Browse categories
   - View business details
   - Click WhatsApp buttons
   - Test Google login
   - Check if admin users can access `/admin`

## Common Issues

### Issue: "Invalid login credentials" when signing in

**Solution**: Make sure Google OAuth is properly configured in Supabase with correct redirect URIs.

### Issue: Database tables not found

**Solution**: Run `supabase db push` to push your schema to production.

### Issue: Environment variables not updating

**Solution**: After changing environment variables in Vercel, you must redeploy (or trigger a new deployment).

### Issue: Google OAuth redirect mismatch

**Solution**: Ensure all redirect URIs are added in Google Cloud Console and Supabase Auth settings.

## Post-Deployment

### Enable Row Level Security (RLS)

Verify RLS policies are active in production:

```bash
# Check RLS status
supabase db diff --linked
```

### Monitor Your App

- **Supabase Dashboard**: Monitor database usage, auth, and API calls
- **Vercel Analytics**: Track page views and performance
- **Vercel Logs**: Debug runtime errors

### Set Up Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase Site URL and Google OAuth redirect URIs

## Quick Reference Commands

```bash
# Push schema changes to production
supabase db push

# Generate updated TypeScript types
supabase gen types typescript --linked > types/supabase.ts

# Deploy to Vercel
vercel --prod

# View production logs
vercel logs
```

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
