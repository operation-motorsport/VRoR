-- Manual Admin User Setup
-- Since auth.uid() returns null in SQL Editor, we need to do this manually

-- STEP 1: Find your user ID from the auth.users table
-- Copy your actual user ID from this query:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- STEP 2: Replace 'YOUR_USER_ID_HERE' with your actual UUID from step 1
-- Replace 'your-email@example.com' with your actual email
INSERT INTO users (id, email, role)
VALUES ('3b5c1e4d-ca62-4185-b795-b87c51772020', 'nate.dowd@operationmotorsport.org', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- EXAMPLE (DO NOT USE THESE VALUES):
-- INSERT INTO users (id, email, role)
-- VALUES ('a1b2c3d4-e5f6-7890-abcd-123456789012', 'admin@example.com', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- STEP 3: Verify the user was created
SELECT * FROM users;

-- STEP 4: Test if you can now insert veterans (replace with real data)
-- INSERT INTO veterans (first_name, last_name, military_branch)
-- VALUES ('Test', 'Veteran', 'US Army');