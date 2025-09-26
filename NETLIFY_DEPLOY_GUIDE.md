# Netlify Deployment Guide

## Quick Setup Steps

### 1. Environment Variables in Netlify
After connecting your GitHub repo to Netlify, add these environment variables in your Netlify site settings:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=OPMO Veterans Race
VITE_APP_VERSION=1.0.0
```

### 2. Build Settings
Netlify will auto-detect these from `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### 3. Supabase Setup
Make sure your Supabase project has:
- Row Level Security (RLS) enabled
- Proper authentication policies
- Database schema from `supabase-schema.sql`

### 4. Domain Configuration
In Supabase:
1. Go to Authentication > URL Configuration
2. Add your Netlify domain to "Site URL"
3. Add your Netlify domain to "Redirect URLs"

Example:
- Site URL: `https://your-app-name.netlify.app`
- Redirect URLs: `https://your-app-name.netlify.app/**`

### 5. Testing Checklist
After deployment:
- [ ] App loads without errors
- [ ] Authentication works
- [ ] All pages navigate correctly
- [ ] Mobile responsive design
- [ ] Logo displays properly
- [ ] Environment variables are loaded

## Troubleshooting

### Common Issues:
1. **White screen:** Check browser console for environment variable errors
2. **Auth errors:** Verify Supabase URL configuration
3. **Build fails:** Check Node version and dependencies
4. **404 on refresh:** Ensure SPA redirects are working (configured in netlify.toml)

### Performance Optimization:
- Images are cached for 1 year
- Assets are cached with immutable headers
- Security headers are applied
- SPA routing is properly configured

## Auto-Deploy
Every push to your main branch will trigger a new deployment automatically.