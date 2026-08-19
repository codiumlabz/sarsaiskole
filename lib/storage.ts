"use client";

import { Student, Subject } from "@/types";
import { initialStudents, initialSubjects } from "./mock-data";

const STUDENTS_KEY = "sms_students_data_v1";
const SUBJECTS_KEY = "sms_subjects_data_v1";

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

export function saveStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Failed to save students to localStorage", error);
  }
}

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

export function saveSubjects(subjects: Subject[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error("Failed to save subjects to localStorage", error);
  }
}

export function resetToDemoData(): { students: Student[]; subjects: Subject[] } {
  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(initialStudents));
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(initialSubjects));
  }
  return { students: initialStudents, subjects: initialSubjects };
}
