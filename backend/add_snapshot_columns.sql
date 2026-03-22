-- Migration: Add snapshot columns to result_sheets table
-- Run this SQL script on your database

-- Add student_snapshot column
ALTER TABLE result_sheets
ADD COLUMN IF NOT EXISTS student_snapshot TEXT;

-- Add class_snapshot column
ALTER TABLE result_sheets
ADD COLUMN IF NOT EXISTS class_snapshot TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'result_sheets'
AND column_name IN ('student_snapshot', 'class_snapshot');
