"use client";

import * as React from "react";
import { Student, Subject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, UserCheck, BookOpen, Check, CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveStudent: (student: Student, isNew: boolean) => void;
  subjects: Subject[];
  initialData?: Student | null;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  onSaveStudent,
  subjects,
  initialData,
}: AddStudentDialogProps) {
  const isEditing = !!initialData;

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [studentId, setStudentId] = React.useState("");
  const [grade, setGrade] = React.useState("Grade 10");
  const [status, setStatus] = React.useState<Student["status"]>("Active");
  const [gender, setGender] = React.useState<"Male" | "Female" | "Other">("Female");
  const [phone, setPhone] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<Student["paymentStatus"]>("Paid");
  const [monthlyFeeAmount, setMonthlyFeeAmount] = React.useState("180");
  const [paymentMonth, setPaymentMonth] = React.useState("September 2026");
  const [lastPaymentDate, setLastPaymentDate] = React.useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when dialog opens or editing student changes
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setEmail(initialData.email);
        setStudentId(initialData.studentId);
        setGrade(initialData.grade);
        setStatus(initialData.status);
        setGender(initialData.gender || "Female");
        setPhone(initialData.phone || "");
        setDateOfBirth(initialData.dateOfBirth || "");
        setAddress(initialData.address || "");
        setPaymentStatus(initialData.paymentStatus || "Paid");
        setMonthlyFeeAmount(initialData.monthlyFeeAmount ? initialData.monthlyFeeAmount.toString() : "180");
        setPaymentMonth(initialData.paymentMonth || "September 2026");
        setLastPaymentDate(initialData.lastPaymentDate || "");
        setSelectedSubjectIds(initialData.enrolledSubjectIds || []);
      } else {
        // New student default
        const randomNum = Math.floor(100 + Math.random() * 900);
        setName("");
        setEmail("");
        setStudentId(`STU-2026-${randomNum}`);
        setGrade("Grade 10");
        setStatus("Active");
        setGender("Female");
        setPhone("+1 (555) ");
        setDateOfBirth("2009-05-15");
        setAddress("");
        setPaymentStatus("Paid");
        setMonthlyFeeAmount("180");
        setPaymentMonth("September 2026");
        setLastPaymentDate(new Date().toISOString().split("T")[0]);
        // default select first 2 subjects if available
        setSelectedSubjectIds(subjects.slice(0, 2).map((s) => s.id));
      }
      setErrors({});
    }
  }, [open, initialData, subjects]);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Enter a valid email address";
    }
    if (!studentId.trim()) newErrors.studentId = "Student ID is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const studentToSave: Student = {
      id: initialData?.id || `stu-${Date.now()}`,
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      grade,
      status,
      gender,
      phone: phone.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
      attendanceRate: initialData?.attendanceRate || 95,
      paymentStatus,
      monthlyFeeAmount: parseFloat(monthlyFeeAmount) || 180,
      paymentMonth: paymentMonth.trim() || "September 2026",
      lastPaymentDate: paymentStatus === "Paid" ? (lastPaymentDate || new Date().toISOString().split("T")[0]) : undefined,
      enrolledSubjectIds: selectedSubjectIds,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSaveStudent(studentToSave, !isEditing);
    toast.success(
      isEditing
        ? `Student ${studentToSave.name} updated successfully!`
        : `Student ${studentToSave.name} registered successfully!`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {isEditing ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Student Information" : "Add New Student"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the student's profile details, course enrollments, and payment status."
                  : "Enter the details to register a new student and generate their unique verification QR pass."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Maya Lin"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="maya.lin@school.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentId" className="text-xs font-semibold">
                Student ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentId"
                placeholder="STU-2026-009"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade" className="text-xs font-semibold">
                Grade / Year Level
              </Label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Grade 9">Grade 9 (Freshman)</option>
                <option value="Grade 10">Grade 10 (Sophomore)</option>
                <option value="Grade 11">Grade 11 (Junior)</option>
                <option value="Grade 12">Grade 12 (Senior)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">
                Enrollment Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Student["status"])}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-semibold">
                Gender
              </Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-xs font-semibold">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">
                Residential Address
              </Label>
              <Input
                id="address"
                placeholder="e.g. 123 Education Blvd, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Section: Monthly Course Payment Setup */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Course Payment Status (Current Month)
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {paymentMonth}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/20 rounded-xl border border-border">
              <div className="space-y-1.5">
                <Label htmlFor="paymentStatus" className="text-xs font-medium">
                  Payment Status
                </Label>
                <select
                  id="paymentStatus"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as Student["paymentStatus"])}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Paid">Paid (Current Month)</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyFee" className="text-xs font-medium">
                  Monthly Fee ($ / Amount)
                </Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  placeholder="180"
                  value={monthlyFeeAmount}
                  onChange={(e) => setMonthlyFeeAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentDate" className="text-xs font-medium">
                  Payment / Settlement Date
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={lastPaymentDate}
                  onChange={(e) => setLastPaymentDate(e.target.value)}
                  disabled={paymentStatus !== "Paid"}
                />
              </div>
            </div>
          </div>

          {/* Section: Assign Subjects Setup */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                Assign Enrolled Subjects ({selectedSubjectIds.length} selected)
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Select courses for this student
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-muted/20 rounded-lg border border-border">
              {subjects.map((sub) => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer transition-all text-xs select-none ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 text-foreground font-medium"
                        : "bg-card border-border hover:bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40 bg-background"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary">{sub.code}</span>
                        <span className="font-semibold truncate text-foreground">{sub.name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {sub.teacher} • {sub.department}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Register Student & Generate QR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
