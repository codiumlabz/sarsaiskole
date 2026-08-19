"use client";

import * as React from "react";
import { Student, Subject } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface StudentTableProps {
  students: Student[];
  subjects: Subject[];
  isLoading: boolean;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export function StudentTable({
  students,
  subjects,
  isLoading,
  onAddStudent,
  onEditStudent,
  onViewStudent,
  onDeleteStudent,
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [gradeFilter, setGradeFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [subjectFilter, setSubjectFilter] = React.useState("ALL");

  // Delete confirmation state
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null);

  // Subject lookup map
  const subjectMap = React.useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Filter students based on search term and dropdown filters
  const filteredStudents = React.useMemo(() => {
    return students.filter((student) => {
      // Search term query
      const matchesSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

      // Grade filter
      const matchesGrade =
        gradeFilter === "ALL" || student.grade === gradeFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" || student.status === statusFilter;

      // Subject filter
      const matchesSubject =
        subjectFilter === "ALL" ||
        student.enrolledSubjectIds.includes(subjectFilter);

      return matchesSearch && matchesGrade && matchesStatus && matchesSubject;
    });
  }, [students, searchTerm, gradeFilter, statusFilter, subjectFilter]);

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      toast.success(`Student ${studentToDelete.name} has been removed.`);
      setStudentToDelete(null);
    }
  };

  const getStatusBadge = (status: Student["status"]) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "Suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "Graduated":
        return <Badge variant="info">Graduated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Graduated">Graduated</option>
          </select>

          {/* Subject filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring max-w-[150px] truncate"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          {/* Primary Action Button */}
          <Button onClick={onAddStudent} className="h-10 gap-1.5 shadow-sm">
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[260px]">Student Profile</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Grade Level</TableHead>
              <TableHead className="min-w-[200px]">Enrolled Subjects</TableHead>
              <TableHead>GPA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading Skeleton Rows */}
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-14 rounded" />
                      <Skeleton className="h-5 w-14 rounded" />
                      <Skeleton className="h-5 w-10 rounded" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-2 opacity-40" />
                    <p className="font-semibold text-foreground">No students found</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      {searchTerm || gradeFilter !== "ALL" || statusFilter !== "ALL" || subjectFilter !== "ALL"
                        ? "Try adjusting your search query or filters to find what you're looking for."
                        : "No students have been registered yet. Click 'Add Student' to get started."}
                    </p>
                    {(searchTerm || gradeFilter !== "ALL" || statusFilter !== "ALL" || subjectFilter !== "ALL") && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => {
                          setSearchTerm("");
                          setGradeFilter("ALL");
                          setStatusFilter("ALL");
                          setSubjectFilter("ALL");
                        }}
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const initials = student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const enrolledSubjects = student.enrolledSubjectIds
                  .map((id) => subjectMap.get(id))
                  .filter((s): s is Subject => !!s);

                return (
                  <TableRow key={student.id} className="group">
                    {/* Student Avatar + Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-primary/20 bg-primary/10 text-primary">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <div
                            onClick={() => onViewStudent(student)}
                            className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {student.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Student ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {student.studentId}
                      </span>
                    </TableCell>

                    {/* Grade */}
                    <TableCell>
                      <span className="text-sm font-medium">{student.grade}</span>
                    </TableCell>

                    {/* Enrolled Subjects */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {enrolledSubjects.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">
                            No subjects
                          </span>
                        ) : (
                          enrolledSubjects.map((sub) => (
                            <span
                              key={sub.id}
                              title={`${sub.name} (${sub.teacher})`}
                              className="inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                            >
                              {sub.code}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>

                    {/* GPA */}
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {student.gpa ? student.gpa.toFixed(2) : "—"}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(student.status)}</TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => onViewStudent(student)}
                          title="View Profile Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => onEditStudent(student)}
                          title="Edit Student Information"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setStudentToDelete(student)}
                          title="Delete Student Record"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer Summary */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <div>
            Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold text-foreground">{students.length}</span> students
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Database Synchronized</span>
          </div>
        </div>
      </div>

      {/* Delete Student Confirmation Modal */}
      <Dialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold">
                Delete Student Record
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm text-foreground/80">
              Are you sure you want to delete{" "}
              <strong className="text-foreground font-semibold">
                {studentToDelete?.name}
              </strong>{" "}
              ({studentToDelete?.studentId})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setStudentToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
