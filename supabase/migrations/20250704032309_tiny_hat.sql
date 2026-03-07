/*
  # Add audioVideo column to meetings table

  1. Changes
    - Add `audioVideo` column to `meetings` table if it doesn't exist
    - Set default value to empty string for consistency
  
  2. Safety
    - Uses conditional logic to only add column if it doesn't exist
    - No data loss risk as this is an additive change
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'audioVideo'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "audioVideo" text DEFAULT '';
  END IF;
END $$;