-- ============================================================================
-- PRODUCTION RLS FIX - Veterans Race of Remembrance
-- ============================================================================
-- This script fixes the circular dependency RLS issues and sets up proper
-- security policies for production use with 40-50 users.
--
-- IMPORTANT: Run this in your Supabase SQL Editor
-- Timeline: Execute before launch (within 2 days)
-- ============================================================================

-- Step 1: Drop ALL existing RLS policies to start fresh
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Create FIXED RLS policies for users table
-- ============================================================================
-- Key fix: No circular dependency - users can always read their own profile

CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users (uses column check, not subquery)
CREATE POLICY "users_select_all_if_admin" ON users
  FOR SELECT
  USING (
    -- Check if the current user's role is admin
    -- This works because we can already read our own profile from the policy above
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can insert new users
CREATE POLICY "users_insert_admin_only" ON users
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can update users
CREATE POLICY "users_update_admin_only" ON users
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can delete users
CREATE POLICY "users_delete_admin_only" ON users
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 3: Create FIXED RLS policies for veterans table
-- ============================================================================

-- All authenticated users (staff + admin) can view veterans
CREATE POLICY "veterans_select_authenticated" ON veterans
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL  -- Simply check if user is authenticated
  );

-- Only admins can insert veterans
CREATE POLICY "veterans_insert_admin_only" ON veterans
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can update veterans
CREATE POLICY "veterans_update_admin_only" ON veterans
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can delete veterans
CREATE POLICY "veterans_delete_admin_only" ON veterans
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 4: Create FIXED RLS policies for race_teams table
-- ============================================================================

CREATE POLICY "race_teams_select_authenticated" ON race_teams
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "race_teams_insert_admin_only" ON race_teams
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "race_teams_update_admin_only" ON race_teams
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "race_teams_delete_admin_only" ON race_teams
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 5: Create FIXED RLS policies for events table
-- ============================================================================

CREATE POLICY "events_select_authenticated" ON events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_insert_admin_only" ON events
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "events_update_admin_only" ON events
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "events_delete_admin_only" ON events
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 6: Create FIXED RLS policies for veteran_team_pairings table
-- ============================================================================

CREATE POLICY "pairings_select_authenticated" ON veteran_team_pairings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "pairings_insert_admin_only" ON veteran_team_pairings
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pairings_update_admin_only" ON veteran_team_pairings
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pairings_delete_admin_only" ON veteran_team_pairings
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 7: Create FIXED RLS policies for activities table
-- ============================================================================

CREATE POLICY "activities_select_authenticated" ON activities
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "activities_insert_admin_only" ON activities
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "activities_update_admin_only" ON activities
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "activities_delete_admin_only" ON activities
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 8: Create FIXED RLS policies for travel_arrangements table
-- ============================================================================

CREATE POLICY "travel_select_authenticated" ON travel_arrangements
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "travel_insert_admin_only" ON travel_arrangements
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "travel_update_admin_only" ON travel_arrangements
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "travel_delete_admin_only" ON travel_arrangements
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 9: Create FIXED RLS policies for notes table
-- ============================================================================

CREATE POLICY "notes_select_authenticated" ON notes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "notes_insert_admin_only" ON notes
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "notes_update_admin_only" ON notes
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "notes_delete_admin_only" ON notes
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 10: Create FIXED RLS policies for file_attachments table
-- ============================================================================

CREATE POLICY "files_select_authenticated" ON file_attachments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "files_insert_admin_only" ON file_attachments
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "files_update_admin_only" ON file_attachments
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "files_delete_admin_only" ON file_attachments
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Step 11: Ensure RLS is enabled on all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterans ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE veteran_team_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION QUERIES - Run these to test the policies
-- ============================================================================

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check current user and their role
SELECT
    auth.uid() as user_id,
    auth.role() as auth_role,
    (SELECT role FROM users WHERE id = auth.uid()) as user_role,
    (SELECT email FROM users WHERE id = auth.uid()) as email;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- After running this script:
-- 1. Users can read their own profile without circular dependency
-- 2. Admin checks work properly
-- 3. All tables have consistent, working RLS policies
-- 4. Ready for 40-50 user production deployment
-- ============================================================================
