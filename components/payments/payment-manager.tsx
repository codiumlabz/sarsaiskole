"use client";

import * as React from "react";
import { Student, Subject, CardType, PaymentStatus } from "@/types";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import {
  Search,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ticket,
  QrCode,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentManagerProps {
  students: Student[];
  subjects: Subject[];
  isLoading: boolean;
  onUpdateStudentPayment: (updatedStudent: Student, isNew: boolean) => void;
  onShowQr: (student: Student) => void;
  onViewStudent?: (student: Student) => void;
}

export function PaymentManager({
  students,
  subjects,
  isLoading,
  onUpdateStudentPayment,
  onShowQr,
  onViewStudent,
}: PaymentManagerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");
  const [cardTypeFilter, setCardTypeFilter] = React.useState<string>("ALL");
  const [gradeFilter, setGradeFilter] = React.useState<string>("ALL");
  const [monthFilter, setMonthFilter] = React.useState<string>("ALL");

  // Dialog state for recording/editing payment
  const [selectedStudentForPayment, setSelectedStudentForPayment] = React.useState<Student | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = React.useState(false);

  // Unique list of payment months from data
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.paymentMonth) set.add(s.paymentMonth);
    });
    set.add("September 2026");
    return Array.from(set);
  }, [students]);

  // Filtered students
  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        searchTerm === "" ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());

      const status = s.paymentStatus || "Paid";
      const matchesPayment =
        paymentStatusFilter === "ALL" || status === paymentStatusFilter;

      const card = s.cardType || "Full Card";
      const matchesCard =
        cardTypeFilter === "ALL" || card === cardTypeFilter;

      const matchesGrade =
        gradeFilter === "ALL" || s.grade === gradeFilter;

      const matchesMonth =
        monthFilter === "ALL" || (s.paymentMonth || "September 2026") === monthFilter;

      return matchesSearch && matchesPayment && matchesCard && matchesGrade && matchesMonth;
    });
  }, [students, searchTerm, paymentStatusFilter, cardTypeFilter, gradeFilter, monthFilter]);

  // Calculation Metrics
  const metrics = React.useMemo(() => {
    let totalCollected = 0;
    let totalPendingAmount = 0;
    let totalUnpaidAmount = 0;

    let paidCount = 0;
    let pendingCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;

    let fullCardCount = 0;
    let halfCardCount = 0;
    let freeCardCount = 0;

    students.forEach((s) => {
      const fee = s.monthlyFeeAmount !== undefined ? s.monthlyFeeAmount : 180;
      const card = s.cardType || "Full Card";
      const status = s.paymentStatus || "Paid";

      if (card === "Full Card") fullCardCount++;
      else if (card === "Half Card") halfCardCount++;
      else if (card === "Free Card") freeCardCount++;

      if (status === "Paid") {
        paidCount++;
        totalCollected += fee;
      } else if (status === "Pending") {
        pendingCount++;
        totalPendingAmount += fee;
      } else if (status === "Unpaid") {
        unpaidCount++;
        totalUnpaidAmount += fee;
      } else if (status === "Overdue") {
        overdueCount++;
        totalUnpaidAmount += fee;
      }
    });

    const totalStudents = students.length;
    const collectionRate = totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0;

    return {
      totalCollected,
      totalPendingAmount,
      totalUnpaidAmount,
      paidCount,
      pendingCount,
      unpaidCount,
      overdueCount,
      fullCardCount,
      halfCardCount,
      freeCardCount,
      collectionRate,
    };
  }, [students]);

  // Fast In-line Status Change
  const handleQuickStatusChange = (student: Student, newStatus: PaymentStatus) => {
    const updated: Student = {
      ...student,
      paymentStatus: newStatus,
      lastPaymentDate: newStatus === "Paid" ? new Date().toISOString().split("T")[0] : undefined,
    };
    onUpdateStudentPayment(updated, false);
    toast.success(`${student.name} marked as ${newStatus}`);
  };

  // Fast In-line Card Type Change
  const handleQuickCardTypeChange = (student: Student, newCard: CardType) => {
    const enrolledCount = student.enrolledSubjectIds?.length || 0;
    const baseFullFee = Math.max(enrolledCount * 60, 60);

    let newFee = student.monthlyFeeAmount || 180;
    if (newCard === "Free Card") {
      newFee = 0;
    } else if (newCard === "Half Card") {
      newFee = Math.round(baseFullFee / 2);
    } else {
      newFee = baseFullFee;
    }

    const updated: Student = {
      ...student,
      cardType: newCard,
      monthlyFeeAmount: newFee,
    };
    onUpdateStudentPayment(updated, false);
    toast.success(`${student.name} switched to ${newCard} ($${newFee}/mo)`);
  };

  const getCardTypeBadge = (cardType?: CardType) => {
    switch (cardType) {
      case "Half Card":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold gap-1">
            <Ticket className="h-3 w-3 text-amber-500" />
            Half Card (50%)
          </Badge>
        );
      case "Free Card":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold gap-1">
            <Ticket className="h-3 w-3 text-emerald-500" />
            Free Card
          </Badge>
        );
      case "Full Card":
      default:
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20 text-xs font-semibold gap-1">
            <Ticket className="h-3 w-3 text-blue-500" />
            Full Card
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <Badge variant="success" className="text-xs font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="warning" className="text-xs font-semibold gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "Unpaid":
        return (
          <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20 text-xs font-semibold gap-1">
            <AlertCircle className="h-3 w-3 text-orange-500" />
            Not Paid
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="destructive" className="text-xs font-semibold gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Payment Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Paid / Collected */}
        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Fees Paid
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${metrics.totalCollected}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {metrics.paidCount} students ({metrics.collectionRate}%)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics.collectionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pending / In Progress */}
        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Settlement
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${metrics.totalPendingAmount}
              </span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {metrics.pendingCount} students
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Payments awaiting admin verification
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Not Paid / Overdue */}
        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Not Paid & Overdue
              </span>
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${metrics.totalUnpaidAmount}
              </span>
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                {metrics.unpaidCount + metrics.overdueCount} students
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {metrics.unpaidCount} not paid • {metrics.overdueCount} overdue
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Card Types Breakdown */}
        <Card className="border-border/80 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Card Types
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-1 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Full: {metrics.fullCardCount}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Half: {metrics.halfCardCount}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Free: {metrics.freeCardCount}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Total {students.length} active registered cards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student by name, student ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Payment Status Filter (Paid / Pending / Not Paid / Overdue) */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Status: Paid (Settled)</option>
            <option value="Pending">Status: Pending</option>
            <option value="Unpaid">Status: Not Paid</option>
            <option value="Overdue">Status: Overdue</option>
          </select>

          {/* Card Type Filter (Full Card / Half Card / Free Card) */}
          <select
            value={cardTypeFilter}
            onChange={(e) => setCardTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Card Types</option>
            <option value="Full Card">Card: Full Card</option>
            <option value="Half Card">Card: Half Card (50%)</option>
            <option value="Free Card">Card: Free Card</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          {/* Clear Filters */}
          {(searchTerm ||
            paymentStatusFilter !== "ALL" ||
            cardTypeFilter !== "ALL" ||
            gradeFilter !== "ALL" ||
            monthFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setPaymentStatusFilter("ALL");
                setCardTypeFilter("ALL");
                setGradeFilter("ALL");
                setMonthFilter("ALL");
              }}
              className="h-10 text-xs gap-1 border-dashed"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 3. Main Payment Management Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[240px]">Student Profile</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Card Type</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Fee Month & Settlement</TableHead>
              <TableHead className="text-right pr-6">Quick Payment Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`pay-skeleton-${idx}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <CreditCard className="h-10 w-10 mb-2 opacity-40" />
                    <p className="font-semibold text-foreground">No payment records found</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      {searchTerm || paymentStatusFilter !== "ALL" || cardTypeFilter !== "ALL"
                        ? "Try clearing your search query or adjusting your filters to find records."
                        : "No student records are currently available."}
                    </p>
                    {(searchTerm || paymentStatusFilter !== "ALL" || cardTypeFilter !== "ALL") && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => {
                          setSearchTerm("");
                          setPaymentStatusFilter("ALL");
                          setCardTypeFilter("ALL");
                          setGradeFilter("ALL");
                          setMonthFilter("ALL");
                        }}
                      >
                        Reset all filters
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

                const currentCard = student.cardType || "Full Card";
                const currentStatus = student.paymentStatus || "Paid";
                const feeAmount =
                  student.monthlyFeeAmount !== undefined
                    ? student.monthlyFeeAmount
                    : currentCard === "Half Card"
                    ? 90
                    : currentCard === "Free Card"
                    ? 0
                    : 180;

                const enrolledCount = student.enrolledSubjectIds?.length || 0;

                return (
                  <TableRow key={student.id} className="group hover:bg-muted/40">
                    {/* Student Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-primary/20 bg-primary/10 text-primary">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <div
                            onClick={() => onViewStudent && onViewStudent(student)}
                            className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate text-sm"
                          >
                            {student.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {student.grade} • {enrolledCount} {enrolledCount === 1 ? "Class" : "Classes"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Student ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                        {student.studentId}
                      </span>
                    </TableCell>

                    {/* Card Type with Quick Toggle */}
                    <TableCell>
                      <div className="space-y-1">
                        <div>{getCardTypeBadge(currentCard)}</div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {currentCard !== "Full Card" && (
                            <button
                              type="button"
                              onClick={() => handleQuickCardTypeChange(student, "Full Card")}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Make Full
                            </button>
                          )}
                          {currentCard !== "Half Card" && (
                            <button
                              type="button"
                              onClick={() => handleQuickCardTypeChange(student, "Half Card")}
                              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              Make Half
                            </button>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Monthly Class Fee Amount */}
                    <TableCell>
                      <div className="font-bold text-sm text-foreground">
                        ${feeAmount}
                        <span className="text-[10px] font-normal text-muted-foreground ml-1">
                          / month
                        </span>
                      </div>
                      {currentCard === "Half Card" && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          50% discounted
                        </div>
                      )}
                      {currentCard === "Free Card" && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Scholarship Free
                        </div>
                      )}
                    </TableCell>

                    {/* Fee Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <div>{getPaymentStatusBadge(currentStatus)}</div>
                        {/* Quick 1-click status actions */}
                        <div className="flex items-center gap-2 pt-0.5">
                          {currentStatus !== "Paid" && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(student, "Paid")}
                              className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                            >
                              <Check className="h-3 w-3" /> Mark Paid
                            </button>
                          )}
                          {currentStatus !== "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(student, "Pending")}
                              className="text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              Pending
                            </button>
                          )}
                          {currentStatus !== "Unpaid" && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(student, "Unpaid")}
                              className="text-[10px] font-medium text-orange-600 dark:text-orange-400 hover:underline"
                            >
                              Not Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Month & Settlement */}
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">
                        {student.paymentMonth || "September 2026"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {currentStatus === "Paid" && student.lastPaymentDate ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Paid: {student.lastPaymentDate}
                          </span>
                        ) : currentStatus === "Paid" ? (
                          <span className="text-muted-foreground italic">Settled</span>
                        ) : currentStatus === "Overdue" ? (
                          <span className="text-red-500 font-medium">Payment overdue</span>
                        ) : (
                          <span className="text-muted-foreground italic">Awaiting settlement</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* QR Code Pass */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShowQr(student)}
                          className="h-8 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                          title="Scan / Check QR Pass"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">QR Pass</span>
                        </Button>

                        {/* Edit / Settle Payment */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudentForPayment(student);
                            setIsRecordPaymentOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs gap-1 border-border shadow-xs"
                        >
                          <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Edit / Settle</span>
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
        <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/20">
          <div>
            Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold text-foreground">{students.length}</span> registered student payment records
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Paid: {filteredStudents.filter((s) => (s.paymentStatus || "Paid") === "Paid").length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending: {filteredStudents.filter((s) => s.paymentStatus === "Pending").length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Not Paid: {filteredStudents.filter((s) => s.paymentStatus === "Unpaid" || s.paymentStatus === "Overdue").length}
            </span>
          </div>
        </div>
      </div>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
        student={selectedStudentForPayment}
        subjects={subjects}
        onSavePayment={(updatedStudent) => {
          onUpdateStudentPayment(updatedStudent, false);
          setSelectedStudentForPayment(null);
        }}
      />
    </div>
  );
}
