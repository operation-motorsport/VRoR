-- ============================================================================
-- FIX FILE ATTACHMENTS SCHEMA
-- Make related_id nullable so general files can be uploaded
-- ============================================================================

-- Make related_id nullable (it's currently NOT NULL which is the problem)
ALTER TABLE file_attachments
  ALTER COLUMN related_id DROP NOT NULL;

-- Verify the change
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'file_attachments'
AND column_name IN ('related_type', 'related_id', 'uploaded_by')
ORDER BY ordinal_position;

-- Test insert to verify it works
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO test_user_id;

    -- Try test insert
    INSERT INTO file_attachments (
        filename,
        file_path,
        file_size,
        file_type,
        related_type,
        related_id,
        uploaded_by
    ) VALUES (
        'test-upload.pdf',
        'uploads/test-upload.pdf',
        2048,
        'application/pdf',
        'note',
        NULL,  -- This should now work
        test_user_id
    );

    RAISE NOTICE 'SUCCESS: Test insert worked!';

    -- Clean up test data
    DELETE FROM file_attachments WHERE filename = 'test-upload.pdf';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILED: %', SQLERRM;
END $$;
