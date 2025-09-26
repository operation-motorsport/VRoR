# Operation Motorsport - Veteran's Race of Remembrance Web App

A mobile-first web application for managing veterans, race teams, and events for Operation Motorsport's flagship "Veteran's Race of Remembrance" event.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier)
- Netlify account (for deployment)

### 1. Supabase Setup Instructions

1. **Go to [supabase.com](https://supabase.com)** and sign up
2. **Create a new project:**
   - Project name: `opmo-veterans-race`
   - Database password: Choose a strong password and save it
   - Region: Select closest to your race events
3. **Wait for initialization** (1-2 minutes)
4. **Get your credentials:**
   - Go to Project Settings > API
   - Copy the `Project URL` and `anon public` key

### 2. Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy your Supabase URL and anon key
   - Open `.env.local` file
   - Add your credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Database Schema Setup

**Step 1: Create the main database schema**
1. Go to your Supabase dashboard
2. Click on the "SQL Editor" in the left sidebar
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL Editor
5. Click "Run" to execute

**Step 2: Set up file storage buckets**
1. In the same SQL Editor, create a new query
2. Copy the entire contents of `supabase-storage-setup.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute

**Step 3: Verify setup**
- Go to "Table Editor" in the left sidebar
- You should see tables: users, veterans, race_teams, events, etc.
- Go to "Storage" in the left sidebar
- You should see buckets: veteran-photos, team-photos, event-photos, documents

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Create Your First Admin User

1. **Sign up with your email** using the app
2. **Go to your Supabase dashboard** → Table Editor → users table
3. **Find your user record** and change the `role` from `staff` to `admin`
4. **Refresh the app** - you should now see the Admin tab in navigation

### 6. Ready for Production?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Netlify.

## 📱 Mobile-First Features

- **Touch-optimized navigation** with 44px minimum tap targets
- **Bottom tab navigation** for easy thumb reach
- **Swipeable card interfaces** for quick data browsing
- **Real-time updates** across all users
- **File upload** with mobile camera support (admin only)
- **Offline-friendly** data caching

## 👥 User Roles

- **Staff (50 users)**: View-only access to all data
- **Admin (4 users)**: Full edit, delete, and upload permissions

## 🗄️ Data Management

- Veterans information and contact details
- Race teams and contact information
- Event schedules and race information
- Veteran-team pairings for events
- Activity tracking and notes
- Travel arrangements
- Photo and document uploads

## 🚀 Deployment to Netlify

1. **Connect to Netlify:**
   - Push code to GitHub
   - Connect repository to Netlify
   - Add environment variables in Netlify dashboard

2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 📂 Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Main application pages
├── hooks/          # Custom React hooks
├── lib/            # External service configurations
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.css       # Global styles with Tailwind
```

## 🔒 Security Features

- Row Level Security (RLS) for data access control
- Role-based authentication
- Secure file upload with type validation
- Environment variable protection

## 📊 Free Tier Limits

**Supabase:**
- 500MB database storage
- 1GB file storage
- 50MB file upload limit
- 50,000 monthly active users

**Netlify:**
- 100GB bandwidth
- Automatic SSL
- Custom domain support

Perfect for your needs with room to grow!