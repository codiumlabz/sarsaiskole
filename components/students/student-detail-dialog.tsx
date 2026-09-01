"use client";

import * as React from "react";
import { Student, Subject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  AlertCircle,
} from "lucide-react";

interface StudentDetailDialogProps {
  student: Student | null;
  subjects: Subject[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (student: Student) => void;
  onShowQr?: (student: Student) => void;
}

export function StudentDetailDialog({
  student,
  subjects,
  open,
  onOpenChange,
  onEdit,
  onShowQr,
}: StudentDetailDialogProps) {
  if (!student) return null;

  const enrolledSubjects = subjects.filter((s) =>
    student.enrolledSubjectIds.includes(s.id)
  );

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

  const getPaymentBadge = (payment: Student["paymentStatus"]) => {
    switch (payment) {
      case "Paid":
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Fee Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="warning" className="gap-1 font-semibold">
            <Clock className="h-3.5 w-3.5" /> Fee Pending
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="destructive" className="gap-1 font-semibold">
            <AlertCircle className="h-3.5 w-3.5" /> Fee Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{payment || "Paid"}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20 bg-primary/10 text-primary text-base font-bold">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold">{student.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {student.studentId}
                  </span>
                  {getStatusBadge(student.status)}
                  <Badge variant="outline" className="text-xs">
                    {student.grade}
                  </Badge>
                </div>
              </div>
            </div>

            {onShowQr && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => {
                  onOpenChange(false);
                  onShowQr(student);
                }}
              >
                <QrCode className="h-4 w-4" />
                View QR Pass
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Quick Metrics Grid with Payment Status & Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Monthly Payment Status Card */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                Fee Payment ({student.paymentMonth || "Current Month"})
              </div>
              <div className="flex items-center justify-between">
                <div>{getPaymentBadge(student.paymentStatus)}</div>
                {student.monthlyFeeAmount && (
                  <span className="text-xs font-bold text-foreground">
                    ${student.monthlyFeeAmount}
                  </span>
                )}
              </div>
              {student.lastPaymentDate && student.paymentStatus === "Paid" && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  Paid on: {student.lastPaymentDate}
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                Attendance Rate
              </div>
              <div className="text-lg font-bold text-foreground">
                {student.attendanceRate ? `${student.attendanceRate}%` : "95%"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                Enrolled Subjects
              </div>
              <div className="text-lg font-bold text-foreground">
                {enrolledSubjects.length}{" "}
                <span className="text-xs font-normal text-muted-foreground">Courses</span>
              </div>
            </div>
          </div>

          {/* Contact & Personal Information */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Student Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/60">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">Email:</span>
                <span className="font-medium truncate">{student.email}</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/60">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">Phone:</span>
                <span className="font-medium">{student.phone || "Not provided"}</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/60">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">Date of Birth:</span>
                <span className="font-medium">{student.dateOfBirth || "Not provided"}</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/60">
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">Gender:</span>
                <span className="font-medium">{student.gender || "Not specified"}</span>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-md bg-card border border-border/60 sm:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-xs">Address:</span>
                <span className="font-medium">{student.address || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Enrolled Subjects List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enrolled Subjects & Classes ({enrolledSubjects.length})
              </h4>
            </div>

            {enrolledSubjects.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/40 border border-dashed border-border text-center text-xs text-muted-foreground">
                No subjects currently assigned to this student.
              </div>
            ) : (
              <div className="space-y-2">
                {enrolledSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {sub.code}
                        </span>
                        <span className="font-semibold text-foreground">{sub.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Instructor: {sub.teacher} • {sub.department}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {sub.schedule || "TBA"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(student);
            }}
          >
            Edit Student Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
