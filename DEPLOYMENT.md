# 🚀 Deployment Guide - Operation Motorsport Veterans Race App

This guide will walk you through deploying your completed app to Netlify.

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have completed these steps:

1. **✅ Supabase Setup Complete**
   - Database schema created (`supabase-schema.sql`)
   - Storage buckets configured (`supabase-storage-setup.sql`)
   - Environment variables added to `.env.local`

2. **✅ App Configuration**
   - All dependencies installed (`npm install`)
   - App builds successfully (`npm run build`)
   - Environment variables properly configured

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Code for Git

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OPMO Veterans Race App"
   ```

2. **Create GitHub repository:**
   - Go to [github.com](https://github.com) and create a new repository
   - Name it: `opmo-veterans-race`
   - Make it private (recommended for your data)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/opmo-veterans-race.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Netlify

1. **Create Netlify Account:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up using your GitHub account (recommended)

2. **Connect Repository:**
   - Click "New site from Git"
   - Choose "GitHub"
   - Select your `opmo-veterans-race` repository

3. **Configure Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `18` (add this in Environment Variables)

4. **Add Environment Variables:**
   In Netlify dashboard → Site settings → Environment variables, add:
   ```
   VITE_SUPABASE_URL = your_supabase_url_here
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key_here
   VITE_APP_NAME = OPMO Veterans Race
   VITE_APP_VERSION = 1.0.0
   ```

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (2-3 minutes)

### Step 3: Configure Custom Domain (Optional)

1. **In Netlify Dashboard:**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `veterans-race.operationmotorsport.org`)

2. **Update DNS:**
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS for easier management

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGci...` |
| `VITE_APP_NAME` | App display name | `OPMO Veterans Race` |
| `VITE_APP_VERSION` | App version | `1.0.0` |

## 📱 Mobile Testing

After deployment, test on actual mobile devices:

### iOS Testing:
1. Open Safari on iPhone/iPad
2. Navigate to your deployed URL
3. Tap Share → "Add to Home Screen"
4. Test touch targets and navigation

### Android Testing:
1. Open Chrome on Android device
2. Navigate to your deployed URL
3. Tap menu → "Add to Home screen"
4. Test all functionality

### Key Mobile Features to Test:
- ✅ Login/logout works
- ✅ Bottom navigation is easily tappable
- ✅ All buttons meet 44px minimum size
- ✅ Forms work without zooming
- ✅ File upload works (camera access)
- ✅ Real-time updates work
- ✅ App works in both portrait/landscape

## 🔒 Security Considerations

### Supabase Security:
1. **Row Level Security (RLS)** is enabled on all tables
2. **Role-based permissions** restrict admin functions
3. **File upload policies** limit access to admin users only

### Environment Security:
1. Never commit `.env.local` to Git
2. Use Netlify environment variables for production
3. Regularly rotate Supabase keys if needed

## 🚀 Continuous Deployment

Your app is now set up for automatic deployments:

1. **Make changes locally**
2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push
   ```
3. **Netlify automatically rebuilds and deploys**

## 📊 Monitoring & Analytics

### Netlify Analytics:
- Site performance metrics
- Visitor analytics
- Form submissions

### Supabase Monitoring:
- Database usage
- API calls
- Storage usage
- Real-time connections

## 🆘 Troubleshooting

### Common Issues:

**Build Fails:**
```bash
# Check build locally first
npm run build

# Check environment variables in Netlify
# Ensure all VITE_ variables are set
```

**App Loads But Database Doesn't Work:**
- Verify Supabase environment variables
- Check if database schema was applied correctly
- Verify RLS policies are active

**Mobile Issues:**
- Test viewport meta tag
- Check touch target sizes
- Verify CSS safe-area handling

**File Upload Not Working:**
- Verify storage bucket policies
- Check admin user permissions
- Test file size limits (50MB max)

## 📞 Support

For deployment issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify Supabase connection
4. Test locally first with `npm run dev`

## ✅ Go Live Checklist

Before announcing your app:
- [ ] All environment variables configured
- [ ] Database schema and storage set up
- [ ] Mobile testing completed on iOS and Android
- [ ] Admin accounts created and tested
- [ ] File upload functionality tested
- [ ] Real-time updates working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Netlify)
- [ ] Performance tested on mobile data speeds

**🎉 Your Operation Motorsport Veterans Race app is now live!**