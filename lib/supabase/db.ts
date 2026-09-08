import { Student, Subject } from "@/types";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

/**
 * Database representation of a Subject row in Supabase
 */
export interface DBSubjectRow {
  id: string;
  code: string;
  name: string;
  department: string;
  teacher: string;
  description: string | null;
  schedule: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Database representation of a Student row in Supabase
 */
export interface DBStudentRow {
  id: string;
  student_id: string;
  name: string;
  email: string;
  grade: string;
  gender: "Male" | "Female" | "Other" | null;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  status: "Active" | "Inactive" | "Suspended" | "Graduated";
  enrolled_subject_ids: string[];
  attendance_rate: number | null;
  payment_status: "Paid" | "Pending" | "Overdue";
  monthly_fee_amount: number | null;
  last_payment_date: string | null;
  payment_month: string | null;
  avatar: string | null;
  created_at: string;
  updated_at?: string;
}

export function mapDBSubjectToSubject(row: DBSubjectRow): Subject {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    department: row.department,
    teacher: row.teacher,
    description: row.description || undefined,
    schedule: row.schedule || undefined,
    createdAt: row.created_at,
  };
}

export function mapSubjectToDBSubject(subject: Subject): Omit<DBSubjectRow, "updated_at"> {
  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    department: subject.department,
    teacher: subject.teacher,
    description: subject.description || null,
    schedule: subject.schedule || null,
    created_at: subject.createdAt,
  };
}

export function mapDBStudentToStudent(row: DBStudentRow): Student {
  return {
    id: row.id,
    studentId: row.student_id,
    name: row.name,
    email: row.email,
    grade: row.grade,
    gender: row.gender || undefined,
    phone: row.phone || undefined,
    address: row.address || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    status: row.status,
    enrolledSubjectIds: Array.isArray(row.enrolled_subject_ids) ? row.enrolled_subject_ids : [],
    attendanceRate: row.attendance_rate !== null ? Number(row.attendance_rate) : undefined,
    paymentStatus: row.payment_status,
    monthlyFeeAmount: row.monthly_fee_amount !== null ? Number(row.monthly_fee_amount) : undefined,
    lastPaymentDate: row.last_payment_date || undefined,
    paymentMonth: row.payment_month || undefined,
    avatar: row.avatar || undefined,
    createdAt: row.created_at,
  };
}

export function mapStudentToDBStudent(student: Student): Omit<DBStudentRow, "updated_at"> {
  return {
    id: student.id,
    student_id: student.studentId,
    name: student.name,
    email: student.email,
    grade: student.grade,
    gender: student.gender || null,
    phone: student.phone || null,
    address: student.address || null,
    date_of_birth: student.dateOfBirth || null,
    status: student.status,
    enrolled_subject_ids: student.enrolledSubjectIds || [],
    attendance_rate: student.attendanceRate !== undefined ? Number(student.attendanceRate) : null,
    payment_status: student.paymentStatus,
    monthly_fee_amount: student.monthlyFeeAmount !== undefined ? Number(student.monthlyFeeAmount) : null,
    last_payment_date: student.lastPaymentDate || null,
    payment_month: student.paymentMonth || null,
    avatar: student.avatar || null,
    created_at: student.createdAt,
  };
}

/**
 * Checks if Supabase can be contacted successfully.
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { connected: false, error: "Environment variables not configured." };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, error: "Client initialization failed." };
  }

  try {
    const { error } = await client.from("subjects").select("id").limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: unknown) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown connection error",
    };
  }
}

/**
 * Fetches all subjects from Supabase. Returns null if unconfigured or error occurs.
 */
export async function fetchSubjectsFromDB(): Promise<Subject[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("subjects")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      console.warn("Supabase fetchSubjects error:", error.message);
      return null;
    }

    return (data as DBSubjectRow[]).map(mapDBSubjectToSubject);
  } catch (err) {
    console.warn("Supabase fetchSubjects exception:", err);
    return null;
  }
}

/**
 * Fetches all students from Supabase. Returns null if unconfigured or error occurs.
 */
export async function fetchStudentsFromDB(): Promise<Student[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetchStudents error:", error.message);
      return null;
    }

    return (data as DBStudentRow[]).map(mapDBStudentToStudent);
  } catch (err) {
    console.warn("Supabase fetchStudents exception:", err);
    return null;
  }
}

/**
 * Fetches a single student by id or student_id for QR verification.
 */
export async function fetchStudentByIdFromDB(idOrCode: string): Promise<Student | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Try matching primary key id first
    let { data, error } = await client
      .from("students")
      .select("*")
      .eq("id", idOrCode)
      .maybeSingle();

    if (!data || error) {
      // Try matching student_id (case-insensitive)
      const res = await client
        .from("students")
        .select("*")
        .ilike("student_id", idOrCode)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error || !data) {
      return null;
    }

    return mapDBStudentToStudent(data as DBStudentRow);
  } catch (err) {
    console.warn("Supabase fetchStudentById exception:", err);
    return null;
  }
}

/**
 * Inserts or updates a student in Supabase, and syncs junction table.
 */
export async function saveStudentToDB(student: Student): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbPayload = mapStudentToDBStudent(student);
    const { error: studentError } = await client
      .from("students")
      .upsert(dbPayload, { onConflict: "id" });

    if (studentError) {
      console.error("Supabase upsert student error:", studentError.message);
      return false;
    }

    // Sync student_subjects junction table
    try {
      await client.from("student_subjects").delete().eq("student_id", student.id);

      if (student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0) {
        const junctionRows = student.enrolledSubjectIds.map((subId) => ({
          student_id: student.id,
          subject_id: subId,
        }));
        await client.from("student_subjects").insert(junctionRows);
      }
    } catch (jErr) {
      console.warn("Junction table sync warning:", jErr);
    }

    return true;
  } catch (err) {
    console.error("Supabase saveStudent exception:", err);
    return false;
  }
}

/**
 * Deletes a student from Supabase.
 */
export async function deleteStudentFromDB(studentId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("students").delete().eq("id", studentId);
    if (error) {
      console.error("Supabase delete student error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase deleteStudent exception:", err);
    return false;
  }
}

/**
 * Inserts or updates a subject in Supabase.
 */
export async function saveSubjectToDB(subject: Subject): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbPayload = mapSubjectToDBSubject(subject);
    const { error } = await client
      .from("subjects")
      .upsert(dbPayload, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert subject error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase saveSubject exception:", err);
    return false;
  }
}

/**
 * Deletes a subject from Supabase.
 */
export async function deleteSubjectFromDB(subjectId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("subjects").delete().eq("id", subjectId);
    if (error) {
      console.error("Supabase delete subject error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase deleteSubject exception:", err);
    return false;
  }
}
