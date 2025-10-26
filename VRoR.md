# Veterans Race of Remembrance (VRoR) - Event Management System

## Project Overview

The Veterans Race of Remembrance (VRoR) is a React-based web application designed to manage events, beneficiaries (veterans), race teams, and administrative functions for Operation Motorsport's Veterans Race of Remembrance events. This system serves as an Event Information Hub for staff and administrators to coordinate racing events that pair veterans with race teams.

## Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** as the build tool and development server
- **React Router** for client-side routing

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Google Fonts** (Bebas Neue) for custom typography
- Responsive design with mobile-first approach

### Backend & Database
- **Supabase** for authentication, database, and real-time features
- PostgreSQL database with Row Level Security (RLS) policies
- Real-time subscriptions for data updates

### Key Dependencies
- `@supabase/supabase-js` - Supabase client library
- `react-router-dom` - Client-side routing
- TypeScript for type safety
- Tailwind CSS for styling

## Application Structure

### Pages
1. **Veterans Page** (`/veterans`) - Manage beneficiary veterans
2. **Teams Page** (`/teams`) - Manage race teams
3. **Events Page** (`/events`) - Manage racing events
4. **Schedule Page** (`/schedule`) - View event schedules
5. **Admin Page** (`/admin`) - Administrative dashboard and user management

### Authentication System
- Role-based access control (Staff and Admin roles)
- Admin-only user creation (no public signup)
- Protected routes with authentication guards
- Session management with automatic restoration

### Data Models

#### Core Entities
- **Users**: Staff and admin accounts with role-based permissions
- **Veterans**: Beneficiary information including contact details, military service, medical notes
- **Race Teams**: Team contact information and vehicle details
- **Events**: Racing event details and scheduling
- **Veteran-Team Pairings**: Associations between veterans and race teams for specific events

#### Key Features per Entity
- **Veterans Management**: Add, view, edit veteran profiles with emergency contacts and race team assignments
- **Race Team Integration**: Clickable race team links that display team contact information
- **Administrative Controls**: User management with inline editing capabilities

## Current Capabilities

### User Management
- Admin-only account creation with email and role assignment
- User profile editing with pencil icon interface
- Role management (Staff/Admin) with dropdown selectors
- Session management with enhanced logout functionality

### Veteran/Beneficiary Management
- Add new veterans with comprehensive profile information
- Display veterans in card format showing name, phone, email, and race team
- Clickable veteran cards showing full profile details in modal
- Race team assignment with clickable links to team information
- Search and filtering capabilities

### Race Team Integration
- Race team assignment to veterans
- Clickable race team names that display team contact information
- Database integration for team management

### Administrative Dashboard
- Statistics overview (total users, admins, staff, veterans, teams, events)
- Quick action buttons for adding new entities
- User management interface with inline editing
- File upload management placeholder

## Authentication & Security

### Authentication Flow
- Supabase Auth integration with email/password
- Role-based access control enforced at component level
- Protected routes requiring authentication
- Admin-only areas with additional permission checks

### Recent Security Enhancements
- Removed public user registration
- Admin-only user creation workflow
- Enhanced session management with proper logout handling
- RLS policies for data access control

## Recent Development Work

### Last Completed Feature: Admin User Editing
The most recent development work focused on enhancing the admin dashboard with user editing capabilities:

**What was implemented:**
- Added pencil icon buttons next to each user in the admin dashboard
- Created edit user modal with form for updating email and role
- Implemented proper state management for editing workflow
- Added hover effects and visual feedback for the edit buttons
- Integrated with existing user management system

**Technical details:**
- Added `editingUser`, `editForm`, `editLoading`, and `editError` state variables
- Created `handleEditUser()` and `handleUpdateUser()` functions
- Added edit modal with form validation and error handling
- Positioned pencil icon between role badge and role dropdown
- Used SVG icon with hover states for better UX

**Files modified:**
- `src/pages/AdminPage.tsx` - Added edit functionality and UI components

### Previously Resolved Issues
1. **Logo Management**: Removed OPMO logo, made VRoR logo persistent across pages (except admin)
2. **Sign-out Bug**: Fixed localhost sign-out issue with enhanced session clearing and logout flags
3. **Database Integration**: Resolved RLS policy conflicts and implemented proper admin user setup
4. **UI Enhancements**: Updated veteran list display, added race team clickable links, improved responsive design

## Environment Setup

### Required Environment Variables
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Deployment
- Configured for Netlify deployment
- Environment variables managed through Netlify dashboard
- Automatic builds from GitHub repository

## Next Steps / Potential Improvements
1. Implement actual race team contact info modals (currently shows alerts)
2. Add comprehensive veterans search and filtering
3. Implement file upload functionality for documents
4. Add event scheduling and calendar integration
5. Enhance mobile responsiveness for all components
6. Add data export/import capabilities
7. Implement audit logging for admin actions

## Database Schema Notes
- Uses Supabase PostgreSQL with RLS policies
- Mock data currently used for development/testing
- Manual admin user setup required for initial configuration
- Race team name stored as text field in veterans table (future: normalize to separate race_teams table)

---

**Project Status**: Active development with core functionality implemented. Admin user management completed as of last session. Ready for continued feature development and testing.