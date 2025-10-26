-- Add race_team_name column to veterans table
-- Run this in your Supabase SQL Editor

ALTER TABLE veterans
ADD COLUMN race_team_name TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN veterans.race_team_name IS 'Name of the race team assigned to this veteran';

-- Update existing mock veterans with race team names for testing
UPDATE veterans
SET race_team_name = CASE
  WHEN first_name = 'John' THEN 'Thunder Racing'
  WHEN first_name = 'Mike' THEN 'Speed Demons'
  ELSE NULL
END
WHERE first_name IN ('John', 'Mike');