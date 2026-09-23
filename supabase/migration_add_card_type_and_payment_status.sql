-- ==============================================================================
-- SARSA ISKOLE - MIGRATION: ADD CARD_TYPE & EXTEND PAYMENT_STATUS
-- Description: Run this script in the Supabase SQL Editor on existing databases.
-- Safety: Completely non-destructive (preserves all existing student records).
-- ==============================================================================

-- 1. Add card_type column to students table if not exists
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS card_type VARCHAR(30) DEFAULT 'Full Card';

-- 2. Backfill existing records with default 'Full Card'
UPDATE students 
SET card_type = 'Full Card' 
WHERE card_type IS NULL;

-- 3. Ensure card_type is NOT NULL and constrained to valid values
ALTER TABLE students 
ALTER COLUMN card_type SET NOT NULL;

ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_card_type_check;

ALTER TABLE students 
ADD CONSTRAINT students_card_type_check 
CHECK (card_type IN ('Full Card', 'Half Card', 'Free Card'));

-- 4. Update payment_status check constraint to support 'Unpaid'
-- (Existing values 'Paid', 'Pending', 'Overdue' remain valid, now allowing 'Unpaid')
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_payment_status_check;

ALTER TABLE students 
ADD CONSTRAINT students_payment_status_check 
CHECK (payment_status IN ('Paid', 'Pending', 'Unpaid', 'Overdue'));

-- 5. Add index on card_type for fast query filtering
CREATE INDEX IF NOT EXISTS idx_students_card_type ON students(card_type);

-- 6. Refresh view_students_with_subjects to include the new card_type column
-- (Drop and recreate is required by PostgreSQL when column order changes)
DROP VIEW IF EXISTS view_students_with_subjects CASCADE;

CREATE VIEW view_students_with_subjects AS
SELECT
  s.*,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', sub.id,
          'code', sub.code,
          'name', sub.name,
          'department', sub.department,
          'teacher', sub.teacher,
          'schedule', sub.schedule
        )
      )
      FROM subjects sub
      WHERE sub.id = ANY(s.enrolled_subject_ids)
    ),
    '[]'::json
  ) AS enrolled_subjects
FROM students s;
