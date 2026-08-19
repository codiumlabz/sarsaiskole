"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Student, Subject } from "@/types";
import {
  getStoredStudents,
  getStoredSubjects,
  saveStudents,
  saveSubjects,
  resetToDemoData,
} from "@/lib/storage";

import { LoginCard } from "@/components/auth/login-card";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StudentTable } from "@/components/students/student-table";
import { AddStudentDialog } from "@/components/students/add-student-dialog";
import { StudentDetailDialog } from "@/components/students/student-detail-dialog";
import { SubjectManager } from "@/components/subjects/subject-manager";
import { AddSubjectDialog } from "@/components/subjects/add-subject-dialog";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  BookOpen,
  PlusCircle,
  BarChart3,
  Layers,
  Sparkles,
  BookPlus,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Primary data state
  const [students, setStudents] = React.useState<Student[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState<boolean>(true);

  // Active tab state
  const [activeTab, setActiveTab] = React.useState<string>("students");

  // Student Dialog States
  const [isAddStudentOpen, setIsAddStudentOpen] = React.useState<boolean>(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = React.useState<Student | null>(null);

  // Subject Dialog States
  const [isAddSubjectOpen, setIsAddSubjectOpen] = React.useState<boolean>(false);
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);

  // Load Initial Data from Storage
  React.useEffect(() => {
    if (isAuthenticated) {
      setIsDataLoading(true);
      const loadedStudents = getStoredStudents();
      const loadedSubjects = getStoredSubjects();
      setStudents(loadedStudents);
      setSubjects(loadedSubjects);

      // Simulate a brief loading skeleton state for realistic UX
      const timer = setTimeout(() => {
        setIsDataLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Toggle skeleton loading simulation on demand
  const handleToggleLoadingSim = () => {
    setIsDataLoading((prev) => !prev);
    if (!isDataLoading) {
      toast.info("Simulating skeleton loading state...");
      setTimeout(() => {
        setIsDataLoading(false);
      }, 2000);
    }
  };

  // Reset to Demo Data
  const handleResetData = () => {
    const fresh = resetToDemoData();
    setStudents(fresh.students);
    setSubjects(fresh.subjects);
    toast.success("Database restored to demo records.");
  };

  // Student Operations
  const handleSaveStudent = (studentData: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === studentData.id);
      let updated: Student[];
      if (exists) {
        updated = prev.map((s) => (s.id === studentData.id ? studentData : s));
      } else {
        updated = [studentData, ...prev];
      }
      saveStudents(updated);
      return updated;
    });
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      saveStudents(updated);
      return updated;
    });
  };

  // Subject Operations
  const handleSaveSubject = (subjectData: Subject) => {
    setSubjects((prev) => {
      const exists = prev.some((sub) => sub.id === subjectData.id);
      let updated: Subject[];
      if (exists) {
        updated = prev.map((s) => (s.id === subjectData.id ? subjectData : s));
      } else {
        updated = [subjectData, ...prev];
      }
      saveSubjects(updated);
      return updated;
    });
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string) => {
    // Remove subject from all students who had it enrolled
    setStudents((prevStudents) => {
      const updatedStudents = prevStudents.map((stu) => ({
        ...stu,
        enrolledSubjectIds: stu.enrolledSubjectIds.filter((id) => id !== subjectId),
      }));
      saveStudents(updatedStudents);
      return updatedStudents;
    });

    setSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== subjectId);
      saveSubjects(updated);
      return updated;
    });
  };

  // Render Login Card if not authenticated
  if (authLoading || !isAuthenticated) {
    return <LoginCard />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar Header */}
      <DashboardHeader
        onResetData={handleResetData}
        isLoading={isDataLoading}
        onToggleLoadingSim={handleToggleLoadingSim}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Banner & Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              Academic Administration Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor student enrollments, curriculum subjects, and academic performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingStudent(null);
                setIsAddStudentOpen(true);
              }}
              className="gap-1.5 shadow-sm text-xs sm:text-sm h-9"
            >
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSubject(null);
                setIsAddSubjectOpen(true);
              }}
              className="gap-1.5 border-border shadow-sm text-xs sm:text-sm h-9"
            >
              <BookPlus className="h-4 w-4 text-primary" />
              Setup Subject
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <StatCards
          students={students}
          subjects={subjects}
          isLoading={isDataLoading}
        />

        {/* Tabbed Navigation: Students, Subjects, Academic Setup */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="border-b border-border/80 pb-2">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="students" className="gap-2 text-xs sm:text-sm">
                <Users className="h-4 w-4" />
                <span>Students Directory ({students.length})</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="gap-2 text-xs sm:text-sm">
                <BookOpen className="h-4 w-4" />
                <span>Subject Management ({subjects.length})</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span>Quick Setup & Summary</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Students Directory */}
          <TabsContent value="students" className="space-y-4">
            <StudentTable
              students={students}
              subjects={subjects}
              isLoading={isDataLoading}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsAddStudentOpen(true);
              }}
              onEditStudent={(student) => {
                setEditingStudent(student);
                setIsAddStudentOpen(true);
              }}
              onViewStudent={(student) => {
                setViewingStudent(student);
              }}
              onDeleteStudent={handleDeleteStudent}
            />
          </TabsContent>

          {/* Tab 2: Subject Management */}
          <TabsContent value="subjects" className="space-y-4">
            <SubjectManager
              subjects={subjects}
              students={students}
              isLoading={isDataLoading}
              onAddSubject={() => {
                setEditingSubject(null);
                setIsAddSubjectOpen(true);
              }}
              onEditSubject={(subject) => {
                setEditingSubject(subject);
                setIsAddSubjectOpen(true);
              }}
              onDeleteSubject={handleDeleteSubject}
            />
          </TabsContent>

          {/* Tab 3: Quick Setup & Summary */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions Setup Card */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Administrative Quick Setup
                  </CardTitle>
                  <CardDescription>
                    Configure new student accounts and curriculum subjects in a few clicks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        Register New Student
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add a student profile with email, personal details, and assign their starting courses.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() => {
                          setEditingStudent(null);
                          setIsAddStudentOpen(true);
                        }}
                      >
                        Launch Student Form
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <BookPlus className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        Setup New Subject / Course
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Define course codes, lecture credits, assign instructors, and set classroom schedules.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 text-xs"
                        onClick={() => {
                          setEditingSubject(null);
                          setIsAddSubjectOpen(true);
                        }}
                      >
                        Setup Subject Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Curriculum & Grade Distribution Summary */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Curriculum & Grade Breakdown
                  </CardTitle>
                  <CardDescription>
                    Current distribution of students across grades and department courses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {["Grade 12", "Grade 11", "Grade 10", "Grade 9"].map((grade) => {
                      const count = students.filter((s) => s.grade === grade).length;
                      const percent = students.length ? Math.round((count / students.length) * 100) : 0;
                      return (
                        <div key={grade} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{grade}</span>
                            <span className="text-muted-foreground">
                              {count} students ({percent}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      All subjects verified active
                    </span>
                    <span className="font-semibold text-foreground">
                      {subjects.reduce((sum, s) => sum + s.credits, 0)} Total Credits
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/70 py-4 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Sarsa Iskole Student Management System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Student Dialog */}
      <AddStudentDialog
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
        onSaveStudent={handleSaveStudent}
        subjects={subjects}
        initialData={editingStudent}
      />

      {/* Student Profile Detail Dialog */}
      <StudentDetailDialog
        student={viewingStudent}
        subjects={subjects}
        open={!!viewingStudent}
        onOpenChange={(open) => !open && setViewingStudent(null)}
        onEdit={(student) => {
          setEditingStudent(student);
          setIsAddStudentOpen(true);
        }}
      />

      {/* Add / Edit Subject Dialog */}
      <AddSubjectDialog
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onSaveSubject={handleSaveSubject}
        initialData={editingSubject}
      />
    </div>
  );
}
