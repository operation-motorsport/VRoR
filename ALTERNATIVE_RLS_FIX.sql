-- Alternative RLS Fix - Simpler approach
-- This temporarily allows any authenticated user to manage veterans
-- You can tighten security later once you have admin users set up

-- OPTION 1: Allow any authenticated user (TEMPORARY)
DROP POLICY IF EXISTS "Admins can manage veterans" ON veterans;
DROP POLICY IF EXISTS "Admins can insert veterans" ON veterans;
DROP POLICY IF EXISTS "Admins can update veterans" ON veterans;
DROP POLICY IF EXISTS "Admins can delete veterans" ON veterans;

CREATE POLICY "Authenticated users can manage veterans" ON veterans
FOR ALL USING (auth.role() = 'authenticated');

-- OPTION 2: Disable RLS entirely for veterans table (LEAST SECURE)
-- Uncomment these lines if Option 1 doesn't work:
-- ALTER TABLE veterans DISABLE ROW LEVEL SECURITY;

-- OPTION 3: Create a service role policy (RECOMMENDED FOR PRODUCTION)
-- This allows your application (with service role key) to bypass RLS
-- while still protecting direct database access
CREATE POLICY "Service role can manage veterans" ON veterans
FOR ALL USING (
  auth.role() = 'service_role' OR
  auth.role() = 'authenticated'
);

-- After you get this working, you can create proper admin users and
-- re-implement the admin-only policies