
"use client";

import { Student, Subject } from "@/types";
import { initialStudents, initialSubjects } from "./mock-data";
import {
  fetchStudentsFromDB,
  fetchSubjectsFromDB,
  saveStudentToDB,
  deleteStudentFromDB,
  saveSubjectToDB,
  deleteSubjectFromDB,
} from "./supabase/db";
import { isSupabaseConfigured } from "./supabase/client";

const STUDENTS_KEY = "sms_students_data_v1";
const SUBJECTS_KEY = "sms_subjects_data_v1";

/**
 * Synchronously retrieves cached students from localStorage.
 */
export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") return initialStudents;
  try {
    const data = localStorage.getItem(STUDENTS_KEY);
    if (!data) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(initialStudents));
      return initialStudents;
    }
    return JSON.parse(data);
  } catch {
    return initialStudents;
  }
}

/**
 * Synchronously saves students to localStorage cache.
 */
export function saveStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Failed to save students to localStorage", error);
  }
}

/**
 * Synchronously retrieves cached subjects from localStorage.
 */
export function getStoredSubjects(): Subject[] {
  if (typeof window === "undefined") return initialSubjects;
  try {
    const data = localStorage.getItem(SUBJECTS_KEY);
    if (!data) {
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(initialSubjects));
      return initialSubjects;
    }
    return JSON.parse(data);
  } catch {
    return initialSubjects;
  }
}

/**
 * Synchronously saves subjects to localStorage cache.
 */
export function saveSubjects(subjects: Subject[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error("Failed to save subjects to localStorage", error);
  }
}

/**
 * Asynchronously loads students from Supabase (if configured)
 * and updates localStorage cache. Falls back seamlessly to local cache.
 */
export async function loadStudentsAsync(): Promise<{
  students: Student[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const remoteData = await fetchStudentsFromDB();
    if (remoteData && remoteData.length > 0) {
      saveStudents(remoteData);
      return { students: remoteData, source: "supabase" };
    }
  }
  return { students: getStoredStudents(), source: "local" };
}

/**
 * Asynchronously loads subjects from Supabase (if configured)
 * and updates localStorage cache. Falls back seamlessly to local cache.
 */
export async function loadSubjectsAsync(): Promise<{
  subjects: Subject[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const remoteData = await fetchSubjectsFromDB();
    if (remoteData && remoteData.length > 0) {
      saveSubjects(remoteData);
      return { subjects: remoteData, source: "supabase" };
    }
  }
  return { subjects: getStoredSubjects(), source: "local" };
}

/**
 * Persists student to both localStorage and Supabase.
 */
export async function persistStudent(student: Student, allStudents: Student[]): Promise<void> {
  saveStudents(allStudents);
  if (isSupabaseConfigured()) {
    await saveStudentToDB(student);
  }
}

/**
 * Removes student from both localStorage and Supabase.
 */
export async function removeStudent(studentId: string, updatedStudents: Student[]): Promise<void> {
  saveStudents(updatedStudents);
  if (isSupabaseConfigured()) {
    await deleteStudentFromDB(studentId);
  }
}

/**
 * Persists subject to both localStorage and Supabase.
 */
export async function persistSubject(subject: Subject, allSubjects: Subject[]): Promise<void> {
  saveSubjects(allSubjects);
  if (isSupabaseConfigured()) {
    await saveSubjectToDB(subject);
  }
}

/**
 * Removes subject from both localStorage and Supabase.
 */
export async function removeSubject(subjectId: string, updatedSubjects: Subject[]): Promise<void> {
  saveSubjects(updatedSubjects);
  if (isSupabaseConfigured()) {
    await deleteSubjectFromDB(subjectId);
  }
}

/**
 * Resets local cache to demo records.
 */
export function resetToDemoData(): { students: Student[]; subjects: Subject[] } {
  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(initialStudents));
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(initialSubjects));
  }
  return { students: initialStudents, subjects: initialSubjects };
}
