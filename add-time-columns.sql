-- Migration script to add time_from and time_to columns to events table
-- Run this FIRST before running insert-events.sql

-- Add time_from column
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_from TIME;

-- Add time_to column
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_to TIME;

-- Make location column optional (in case it's still required)
ALTER TABLE events ALTER COLUMN location DROP NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
