-- Fix subjects table constraints
-- Drop the incorrect unique constraint on name only
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_name_key;

-- Drop the incorrect unique constraint on code only
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_code_key;

-- Add the correct composite unique constraints (if they don't exist)
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS uq_school_subject_name;
ALTER TABLE subjects ADD CONSTRAINT uq_school_subject_name UNIQUE (school_id, name);

ALTER TABLE subjects DROP CONSTRAINT IF EXISTS uq_school_subject_code;
ALTER TABLE subjects ADD CONSTRAINT uq_school_subject_code UNIQUE (school_id, code);

-- Verify the constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'subjects'::regclass
ORDER BY conname;
