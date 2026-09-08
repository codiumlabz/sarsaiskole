-- ==============================================================================
-- SARSA ISKOLE - SUPABASE DATABASE SCHEMA & INITIAL DATA SEED
-- Description: Complete schema for Student Information & Subject Management System
-- Compatible with: Supabase / PostgreSQL 14+
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (safe initialization)
DROP VIEW IF EXISTS view_students_with_subjects CASCADE;
DROP TABLE IF EXISTS student_subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ------------------------------------------------------------------------------
-- 3. Table: subjects
-- ------------------------------------------------------------------------------
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  teacher VARCHAR(255) NOT NULL,
  description TEXT,
  schedule VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 4. Table: students
-- ------------------------------------------------------------------------------
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
  phone VARCHAR(50),
  address TEXT,
  date_of_birth DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated')),
  enrolled_subject_ids TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  attendance_rate NUMERIC(5, 2) DEFAULT 95.00 CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Overdue')),
  monthly_fee_amount NUMERIC(10, 2) DEFAULT 180.00,
  last_payment_date DATE,
  payment_month VARCHAR(50) DEFAULT 'September 2026',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 5. Table: student_subjects (Normalized Junction Table)
-- ------------------------------------------------------------------------------
CREATE TABLE student_subjects (
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (student_id, subject_id)
);

-- ------------------------------------------------------------------------------
-- 6. Table: admin_users (Administrative Profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'faculty')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 7. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_payment_status ON students(payment_status);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);

CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject ON student_subjects(subject_id);

-- ------------------------------------------------------------------------------
-- 8. Triggers for Automatic updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 9. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to subjects (needed for course catalog & QR verification)
CREATE POLICY "Allow public read access on subjects"
  ON subjects FOR SELECT
  USING (true);

-- Allow public insert/update/delete on subjects for app administration
CREATE POLICY "Allow full access on subjects"
  ON subjects FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow public read access on students (needed for public QR badge verification /verify/[id])
CREATE POLICY "Allow public read access on students"
  ON students FOR SELECT
  USING (true);

-- Allow full access on students for app administration
CREATE POLICY "Allow full access on students"
  ON students FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow full access on student_subjects junction
CREATE POLICY "Allow full access on student_subjects"
  ON student_subjects FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow read and write on admin_users
CREATE POLICY "Allow full access on admin_users"
  ON admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. Convenient View for Students with Enrolled Subject Details
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_students_with_subjects AS
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

-- ==============================================================================
-- 11. INITIAL DATA SEEDING
-- ==============================================================================

-- Subjects Seed
INSERT INTO subjects (id, code, name, department, teacher, description, schedule, created_at)
VALUES
  ('sub-1', 'CS101', 'Introduction to Computer Science', 'Computer Science', 'Dr. Alan Turing', 'Fundamentals of programming, algorithms, and computational problem solving.', 'Mon/Wed 09:00 - 10:30 AM', '2026-01-10T08:00:00Z'),
  ('sub-2', 'MATH201', 'Linear Algebra & Calculus', 'Mathematics', 'Prof. Katherine Johnson', 'Matrix theory, vector spaces, eigenvalues, and multivariable calculus concepts.', 'Tue/Thu 11:00 AM - 12:30 PM', '2026-01-10T08:30:00Z'),
  ('sub-3', 'PHY105', 'General Physics & Mechanics', 'Science', 'Dr. Richard Feynman', 'Newtonian mechanics, kinematics, thermodynamics, and harmonic motion.', 'Mon/Wed 01:00 - 02:30 PM', '2026-01-11T09:00:00Z'),
  ('sub-4', 'ENG102', 'Academic Writing & Literature', 'Humanities', 'Ms. Maya Angelou', 'Critical analysis of contemporary literature and research-oriented writing.', 'Fri 10:00 AM - 01:00 PM', '2026-01-11T10:00:00Z'),
  ('sub-5', 'CHEM110', 'Organic & Physical Chemistry', 'Science', 'Dr. Marie Curie', 'Molecular structures, chemical thermodynamics, bonding, and laboratory assays.', 'Tue/Thu 02:00 - 03:30 PM', '2026-01-12T08:00:00Z'),
  ('sub-6', 'BIO120', 'Cellular & Molecular Biology', 'Science', 'Dr. Rosalind Franklin', 'Cell physiology, genetics, recombinant DNA, and bio-molecular pathways.', 'Wed/Fri 08:30 - 10:00 AM', '2026-01-12T09:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  teacher = EXCLUDED.teacher,
  description = EXCLUDED.description,
  schedule = EXCLUDED.schedule;

-- Students Seed
INSERT INTO students (
  id, student_id, name, email, grade, gender, phone, address, date_of_birth,
  status, enrolled_subject_ids, attendance_rate, payment_status,
  monthly_fee_amount, last_payment_date, payment_month, created_at
)
VALUES
  (
    'stu-1', 'STU-2026-001', 'Elena Rostova', 'elena.rostova@school.edu', 'Grade 12',
    'Female', '+1 (555) 234-5678', '742 Evergreen Terrace, Springfield', '2008-04-14',
    'Active', ARRAY['sub-1', 'sub-2', 'sub-3'], 98.00, 'Paid',
    180.00, '2026-09-01', 'September 2026', '2026-01-15T10:00:00Z'
  ),
  (
    'stu-2', 'STU-2026-002', 'Marcus Vance', 'marcus.vance@school.edu', 'Grade 11',
    'Male', '+1 (555) 345-6789', '108 Ocean View Drive, Malibu', '2009-07-22',
    'Active', ARRAY['sub-1', 'sub-4', 'sub-5'], 94.00, 'Pending',
    180.00, NULL, 'September 2026', '2026-01-16T11:20:00Z'
  ),
  (
    'stu-3', 'STU-2026-003', 'Amina Al-Mansoor', 'amina.almansoor@school.edu', 'Grade 12',
    'Female', '+1 (555) 456-7890', '450 University Ave, Cambridge', '2008-11-03',
    'Active', ARRAY['sub-2', 'sub-3', 'sub-6'], 99.00, 'Paid',
    180.00, '2026-08-30', 'September 2026', '2026-01-16T14:45:00Z'
  ),
  (
    'stu-4', 'STU-2026-004', 'Lucas Silva', 'lucas.silva@school.edu', 'Grade 10',
    'Male', '+1 (555) 567-8901', '89 Pine Ridge Road, Austin', '2010-02-18',
    'Active', ARRAY['sub-1', 'sub-2'], 91.00, 'Paid',
    120.00, '2026-09-01', 'September 2026', '2026-01-18T09:15:00Z'
  ),
  (
    'stu-5', 'STU-2026-005', 'Kavya Patel', 'kavya.patel@school.edu', 'Grade 11',
    'Female', '+1 (555) 678-9012', '320 Sunset Boulevard, San Jose', '2009-09-30',
    'Active', ARRAY['sub-1', 'sub-5', 'sub-6'], 97.00, 'Paid',
    180.00, '2026-08-28', 'September 2026', '2026-01-19T13:00:00Z'
  ),
  (
    'stu-6', 'STU-2026-006', 'David Kim', 'david.kim@school.edu', 'Grade 10',
    'Male', '+1 (555) 789-0123', '15 Maple Lane, Seattle', '2010-06-12',
    'Inactive', ARRAY['sub-3', 'sub-4'], 82.00, 'Overdue',
    120.00, NULL, 'September 2026', '2026-01-20T10:30:00Z'
  ),
  (
    'stu-7', 'STU-2026-007', 'Chloe Dupont', 'chloe.dupont@school.edu', 'Grade 12',
    'Female', '+1 (555) 890-1234', '512 Boulevard St-Germain, Chicago', '2008-01-25',
    'Active', ARRAY['sub-1', 'sub-2', 'sub-4', 'sub-5'], 95.00, 'Paid',
    240.00, '2026-09-01', 'September 2026', '2026-01-21T15:10:00Z'
  ),
  (
    'stu-8', 'STU-2026-008', 'Tariq Washington', 'tariq.w@school.edu', 'Grade 11',
    'Male', '+1 (555) 901-2345', '22 King Boulevard, Atlanta', '2009-12-05',
    'Suspended', ARRAY['sub-1', 'sub-3'], 74.00, 'Overdue',
    120.00, NULL, 'September 2026', '2026-01-22T08:45:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  student_id = EXCLUDED.student_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  grade = EXCLUDED.grade,
  gender = EXCLUDED.gender,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  date_of_birth = EXCLUDED.date_of_birth,
  status = EXCLUDED.status,
  enrolled_subject_ids = EXCLUDED.enrolled_subject_ids,
  attendance_rate = EXCLUDED.attendance_rate,
  payment_status = EXCLUDED.payment_status,
  monthly_fee_amount = EXCLUDED.monthly_fee_amount,
  last_payment_date = EXCLUDED.last_payment_date,
  payment_month = EXCLUDED.payment_month;

-- Seed Junction Table student_subjects
INSERT INTO student_subjects (student_id, subject_id)
VALUES
  ('stu-1', 'sub-1'),
  ('stu-1', 'sub-2'),
  ('stu-1', 'sub-3'),
  ('stu-2', 'sub-1'),
  ('stu-2', 'sub-4'),
  ('stu-2', 'sub-5'),
  ('stu-3', 'sub-2'),
  ('stu-3', 'sub-3'),
  ('stu-3', 'sub-6'),
  ('stu-4', 'sub-1'),
  ('stu-4', 'sub-2'),
  ('stu-5', 'sub-1'),
  ('stu-5', 'sub-5'),
  ('stu-5', 'sub-6'),
  ('stu-6', 'sub-3'),
  ('stu-6', 'sub-4'),
  ('stu-7', 'sub-1'),
  ('stu-7', 'sub-2'),
  ('stu-7', 'sub-4'),
  ('stu-7', 'sub-5'),
  ('stu-8', 'sub-1'),
  ('stu-8', 'sub-3')
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- Seed Admin Profile
INSERT INTO admin_users (id, name, email, role)
VALUES
  ('admin-1', 'Dr. Sarah Jenkins', 'admin@school.edu', 'admin')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;
