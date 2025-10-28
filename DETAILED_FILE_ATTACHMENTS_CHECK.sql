-- Get complete table structure with all constraints
SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.columns c
LEFT JOIN information_schema.constraint_column_usage ccu
    ON c.table_name = ccu.table_name
    AND c.column_name = ccu.column_name
LEFT JOIN information_schema.table_constraints tc
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE c.table_schema = 'public'
AND c.table_name = 'file_attachments'
ORDER BY c.ordinal_position;

-- Show the exact table definition
SELECT
    'CREATE TABLE file_attachments (' ||
    string_agg(
        column_name || ' ' ||
        data_type ||
        CASE WHEN character_maximum_length IS NOT NULL
            THEN '(' || character_maximum_length || ')'
            ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL
            THEN ' DEFAULT ' || column_default
            ELSE ''
        END,
        ', '
    ) || ');' as create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'file_attachments';

-- Try inserting with all possible fields
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Get current user
    SELECT auth.uid() INTO test_id;

    -- Try insert
    INSERT INTO file_attachments (
        filename,
        file_path,
        file_size,
        file_type,
        related_type,
        related_id,
        uploaded_by
    ) VALUES (
        'test-file.pdf',
        'uploads/test-file.pdf',
        1024,
        'application/pdf',
        'note',
        NULL,
        test_id
    );

    RAISE NOTICE 'Insert successful!';

    -- Clean up
    DELETE FROM file_attachments WHERE filename = 'test-file.pdf';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Insert failed: %', SQLERRM;
END $$;
