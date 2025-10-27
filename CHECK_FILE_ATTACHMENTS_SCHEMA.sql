-- Check the file_attachments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'file_attachments'
ORDER BY ordinal_position;

-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'file_attachments';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'file_attachments';

-- Try a test insert to see the exact error
-- Run this as your authenticated user to see what happens
INSERT INTO file_attachments (
  filename,
  file_path,
  file_size,
  file_type,
  uploaded_by
) VALUES (
  'test.pdf',
  'uploads/test.pdf',
  1024,
  'application/pdf',
  auth.uid()
) RETURNING *;
