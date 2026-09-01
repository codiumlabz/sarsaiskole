export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  teacher: string;
  description?: string;
  schedule?: string;
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
  attendanceRate?: number;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  monthlyFeeAmount?: number;
  lastPaymentDate?: string;
  paymentMonth?: string;
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
