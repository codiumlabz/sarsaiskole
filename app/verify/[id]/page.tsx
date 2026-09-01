"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Student, Subject } from "@/types";
import { getStoredStudents, getStoredSubjects } from "@/lib/storage";
import { initialStudents, initialSubjects } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  ChevronLeft,
  User,
  School,
} from "lucide-react";

export default function StudentVerificationPage() {
  const params = useParams();
  const studentIdParam = params?.id as string;

  const [student, setStudent] = React.useState<Student | null>(null);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [verifiedAt, setVerifiedAt] = React.useState("");

  React.useEffect(() => {
    setVerifiedAt(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }));

    // Find student in localStorage or fallback mock data
    const storedStudents = getStoredStudents();
    const storedSubjects = getStoredSubjects();

    const allStudents = storedStudents.length ? storedStudents : initialStudents;
    const allSubjects = storedSubjects.length ? storedSubjects : initialSubjects;

    setSubjects(allSubjects);

    const foundStudent = allStudents.find(
      (s) =>
        s.id === studentIdParam ||
        s.studentId?.toLowerCase() === studentIdParam?.toLowerCase()
    );

    setStudent(foundStudent || null);
    setIsLoading(false);
  }, [studentIdParam]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Verifying student credentials...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl">Student Record Not Found</CardTitle>
          <CardDescription className="text-xs">
            We could not locate any student record corresponding to ID <code className="font-mono">{studentIdParam}</code> in the academic registry.
          </CardDescription>
          <Link href="/" className="inline-block pt-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ChevronLeft className="h-4 w-4" />
              Return to Portal
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const enrolledSubjects = subjects.filter((s) =>
    student.enrolledSubjectIds?.includes(s.id)
  );

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isPaid = student.paymentStatus === "Paid";
  const isOverdue = student.paymentStatus === "Overdue";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex flex-col items-center py-6 px-4 sm:px-6">
      {/* Top Mobile Bar */}
      <div className="w-full max-w-lg flex items-center justify-between pb-4 mb-2 border-b border-border/70">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          <span>Administration Portal</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Verification Status Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Official Academic Record Verified
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2 pt-1">
            <GraduationCap className="h-6 w-6 text-primary" />
            Sarsa Iskole Digital Pass
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Scanned on {verifiedAt}
          </p>
        </div>

        {/* Student Profile Identity Card */}
        <Card className="shadow-lg border-border/80 overflow-hidden relative">
          <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-indigo-600" />
          
          <CardHeader className="pb-3 pt-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20 bg-primary/10 text-primary text-lg font-bold shadow-sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    {student.name}
                  </h2>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0 shrink-0">
                    {student.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                    {student.studentId}
                  </span>
                  <span>•</span>
                  <span>{student.grade}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {/* 1. Monthly Course Fee Payment Status Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isPaid
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                  : isOverdue
                  ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <div className="p-1.5 rounded-full bg-emerald-500 text-white shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : isOverdue ? (
                    <div className="p-1.5 rounded-full bg-red-500 text-white shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-amber-500 text-white shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                      Course Payment Status
                    </span>
                    <h3 className="font-bold text-base leading-tight">
                      {isPaid
                        ? `PAID - ${student.paymentMonth || "Current Month"}`
                        : isOverdue
                        ? `OVERDUE - ${student.paymentMonth || "Current Month"}`
                        : `PENDING - ${student.paymentMonth || "Current Month"}`}
                    </h3>
                  </div>
                </div>

                {student.monthlyFeeAmount && (
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Monthly Fee</span>
                    <span className="font-bold text-lg text-foreground">
                      ${student.monthlyFeeAmount}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {isPaid
                    ? `Settled on ${student.lastPaymentDate || "First of month"}`
                    : isOverdue
                    ? "Payment overdue. Please contact admin."
                    : "Pending payment verification"}
                </span>
                <span className="font-semibold underline cursor-default">
                  {isPaid ? "Receipt Verified ✓" : "Action Required"}
                </span>
              </div>
            </div>

            {/* 2. Enrolled Classes & Schedule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Enrolled Classes ({enrolledSubjects.length})
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Current Term Schedule
                </span>
              </div>

              {enrolledSubjects.length === 0 ? (
                <div className="p-3 bg-muted/40 rounded-lg text-center text-xs text-muted-foreground">
                  No subjects currently assigned to this student.
                </div>
              ) : (
                <div className="space-y-2">
                  {enrolledSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 bg-card border border-border/80 rounded-xl space-y-1 hover:border-primary/40 transition-colors shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {sub.code}
                          </span>
                          <span className="font-semibold text-sm text-foreground">
                            {sub.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {sub.department}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-foreground/80">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {sub.teacher}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="h-3 w-3 text-primary" />
                          {sub.schedule || "Weekly Lecture"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Student Details / Contact Summary */}
            <div className="space-y-2 pt-2 border-t border-border/80">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Personal & Contact Information
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/60">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground truncate">{student.email}</span>
                </div>

                {student.phone && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/60">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">{student.phone}</span>
                  </div>
                )}

                {student.attendanceRate && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">Attendance:</span>
                    <span className="font-medium text-foreground">{student.attendanceRate}% Present</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Footer Actions */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save Verification Pass
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication Notice */}
        <div className="text-center text-[11px] text-muted-foreground space-y-1 pb-6">
          <p>
            This verification pass was securely generated by Sarsa Iskole Student Information Portal.
          </p>
          <p>© 2026 Academic Administration & Student Registry.</p>
        </div>
      </div>
    </div>
  );
}
