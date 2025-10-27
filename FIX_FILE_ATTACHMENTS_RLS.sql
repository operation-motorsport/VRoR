-- ============================================================================
-- FIX FILE ATTACHMENTS RLS POLICIES
-- Veterans Race of Remembrance
-- ============================================================================
-- This fixes the RLS issue preventing file uploads
-- ============================================================================

-- Drop existing file_attachments policies
DROP POLICY IF EXISTS "files_select_all" ON file_attachments;
DROP POLICY IF EXISTS "files_insert_all" ON file_attachments;
DROP POLICY IF EXISTS "files_update_all" ON file_attachments;
DROP POLICY IF EXISTS "files_delete_all" ON file_attachments;

-- Create new simple policies that allow authenticated users to do everything
CREATE POLICY "file_attachments_select_all" ON file_attachments
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "file_attachments_insert_all" ON file_attachments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "file_attachments_update_all" ON file_attachments
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "file_attachments_delete_all" ON file_attachments
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'file_attachments';

-- List all policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'file_attachments'
ORDER BY policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
-- This allows all authenticated users to perform all operations on file_attachments
-- Admin vs Staff enforcement happens in the React application code
-- Same approach as other tables (users, veterans, etc.)
-- ============================================================================
