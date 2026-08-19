export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  teacher: string;
  credits: number;
  description?: string;
  schedule?: string;
  room?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  grade: string;
  gender?: "Male" | "Female" | "Other";
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  status: "Active" | "Inactive" | "Suspended" | "Graduated";
  enrolledSubjectIds: string[];
  gpa?: number;
  attendanceRate?: number;
  createdAt: string;
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "faculty";
  avatar?: string;
}
