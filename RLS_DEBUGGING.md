# RLS Policy Debugging Guide

## The Problem
You're getting "row violates row-level security policy for table veterans" when adding beneficiaries.

## Root Cause Analysis

### 1. **Policy Chain Issue**
The current RLS policies create a dependency chain:
- To INSERT into `veterans`, user must be `admin` in `users` table
- But the `users` table might not have the profile created yet
- This creates a chicken-and-egg problem

### 2. **Current Problematic Policy**
```sql
CREATE POLICY "Admins can manage veterans" ON veterans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Solutions (Choose One)

### Solution 1: Fix RLS Policies (RECOMMENDED)
Run the `supabase-rls-fix.sql` file I created, then ensure your user has a profile:

```sql
-- Check if your user has a profile
SELECT * FROM users WHERE id = auth.uid();

-- If no profile exists, create one manually:
INSERT INTO users (id, email, role)
VALUES (auth.uid(), 'your-email@example.com', 'admin');
```

### Solution 2: Temporary RLS Bypass (FOR TESTING ONLY)
```sql
-- DANGER: This disables security temporarily
ALTER TABLE veterans DISABLE ROW LEVEL SECURITY;
-- After testing, re-enable:
-- ALTER TABLE veterans ENABLE ROW LEVEL SECURITY;
```

### Solution 3: Service Role Policy (DEVELOPMENT)
```sql
-- Allow service role (your app) to bypass RLS
CREATE POLICY "Service role bypass" ON veterans
FOR ALL USING (auth.role() = 'service_role');
```

## Debugging Steps

### 1. Check Current User
```sql
SELECT
  auth.uid() as user_id,
  auth.role() as role,
  auth.email() as email;
```

### 2. Check User Profile
```sql
SELECT * FROM users WHERE id = auth.uid();
```

### 3. Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'veterans';
```

### 4. List Current Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'veterans';
```

## Quick Fix Commands

Run these in your Supabase SQL Editor:

```sql
-- 1. Ensure your user has an admin profile
INSERT INTO users (id, email, role)
VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. Apply the fixed policies
-- (Copy/paste the supabase-rls-fix.sql file content)

-- 3. Test the insertion
INSERT INTO veterans (first_name, last_name, military_branch)
VALUES ('Test', 'User', 'US Army');
```

## Verification

After applying fixes, test:
1. Login to your app as admin
2. Try adding a beneficiary
3. Check browser console for any errors
4. Verify data appears in Supabase dashboard