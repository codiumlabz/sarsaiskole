"use client";

import * as React from "react";
import { Student, Subject, CardType, PaymentStatus } from "@/types";
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
import {
  CreditCard,
  CheckCircle2,
  Ticket,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  subjects: Subject[];
  onSavePayment: (updatedStudent: Student) => void;
}

const MONTH_OPTIONS = [
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
  "January 2027",
  "February 2027",
];

export function RecordPaymentDialog({
  open,
  onOpenChange,
  student,
  subjects: _subjects,
  onSavePayment,
}: RecordPaymentDialogProps) {
  const [cardType, setCardType] = React.useState<CardType>("Full Card");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>("Paid");
  const [monthlyFeeAmount, setMonthlyFeeAmount] = React.useState<string>("180");
  const [paymentMonth, setPaymentMonth] = React.useState<string>("September 2026");
  const [paymentDate, setPaymentDate] = React.useState<string>("");
  const [customMonth, setCustomMonth] = React.useState<boolean>(false);

  // Initialize form when student changes or modal opens
  React.useEffect(() => {
    if (student && open) {
      setCardType(student.cardType || "Full Card");
      setPaymentStatus(student.paymentStatus || "Paid");
      setMonthlyFeeAmount(
        student.monthlyFeeAmount !== undefined ? student.monthlyFeeAmount.toString() : "180"
      );
      const m = student.paymentMonth || "September 2026";
      setPaymentMonth(m);
      setCustomMonth(!MONTH_OPTIONS.includes(m));
      setPaymentDate(
        student.lastPaymentDate ||
          (student.paymentStatus === "Paid" ? new Date().toISOString().split("T")[0] : "")
      );
    }
  }, [student, open]);

  if (!student) return null;

  // Compute base fee estimation from subjects
  const enrolledCount = student.enrolledSubjectIds?.length || 0;
  const baseFullFee = Math.max(enrolledCount * 60, 60);

  const handleCardTypeChange = (newCardType: CardType) => {
    setCardType(newCardType);
    if (newCardType === "Free Card") {
      setMonthlyFeeAmount("0");
    } else if (newCardType === "Half Card") {
      const half = Math.round(baseFullFee / 2);
      setMonthlyFeeAmount(half.toString());
    } else {
      setMonthlyFeeAmount(baseFullFee.toString());
    }
  };

  const handleStatusChange = (newStatus: PaymentStatus) => {
    setPaymentStatus(newStatus);
    if (newStatus === "Paid" && !paymentDate) {
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } else if (newStatus === "Unpaid" || newStatus === "Pending") {
      setPaymentDate("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericFee = parseFloat(monthlyFeeAmount) || 0;

    const updatedStudent: Student = {
      ...student,
      cardType,
      paymentStatus,
      monthlyFeeAmount: numericFee,
      paymentMonth,
      lastPaymentDate: paymentStatus === "Paid" ? (paymentDate || new Date().toISOString().split("T")[0]) : undefined,
    };

    onSavePayment(updatedStudent);
    toast.success(`Payment updated for ${student.name}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Student Monthly Class Fee & Card
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update card type (Full Card / Half Card / Free Card) and payment settlement status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Student Quick Summary Header */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm text-foreground">{student.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/60">
                {student.studentId}
              </span>
              <span className="text-xs text-muted-foreground">• {student.grade}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">
              {enrolledCount} {enrolledCount === 1 ? "Subject" : "Subjects"}
            </span>
            <span className="text-xs font-semibold text-primary">
              Est. ${baseFullFee}/mo (Full)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Card Type Selector (Full Card, Half Card, Free Card) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-blue-500" />
                Class Card Type
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Determines tuition concession
              </span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              {/* Full Card */}
              <button
                type="button"
                onClick={() => handleCardTypeChange("Full Card")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  cardType === "Full Card"
                    ? "border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30"
                    : "border-border hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Full Card</span>
                  {cardType === "Full Card" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">100% Standard Fee</p>
              </button>

              {/* Half Card */}
              <button
                type="button"
                onClick={() => handleCardTypeChange("Half Card")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  cardType === "Half Card"
                    ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30"
                    : "border-border hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Half Card</span>
                  {cardType === "Half Card" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">50% Concession</p>
              </button>

              {/* Free Card */}
              <button
                type="button"
                onClick={() => handleCardTypeChange("Free Card")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  cardType === "Free Card"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                    : "border-border hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Free Card</span>
                  {cardType === "Free Card" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">100% Scholarship</p>
              </button>
            </div>
          </div>

          {/* Payment Status Selector (Paid, Pending, Unpaid, Overdue) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              Monthly Fee Payment Status
            </Label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Paid */}
              <button
                type="button"
                onClick={() => handleStatusChange("Paid")}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  paymentStatus === "Paid"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-medium"
                }`}
              >
                <div className="text-xs">Paid (Settled)</div>
              </button>

              {/* Pending */}
              <button
                type="button"
                onClick={() => handleStatusChange("Pending")}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  paymentStatus === "Pending"
                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold ring-1 ring-amber-500"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-medium"
                }`}
              >
                <div className="text-xs">Pending</div>
              </button>

              {/* Unpaid / Not Paid */}
              <button
                type="button"
                onClick={() => handleStatusChange("Unpaid")}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  paymentStatus === "Unpaid"
                    ? "border-orange-500 bg-orange-500/15 text-orange-700 dark:text-orange-300 font-semibold ring-1 ring-orange-500"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-medium"
                }`}
              >
                <div className="text-xs">Not Paid</div>
              </button>

              {/* Overdue */}
              <button
                type="button"
                onClick={() => handleStatusChange("Overdue")}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  paymentStatus === "Overdue"
                    ? "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300 font-semibold ring-1 ring-red-500"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-medium"
                }`}
              >
                <div className="text-xs">Overdue</div>
              </button>
            </div>
          </div>

          {/* Amount & Settlement Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Fee Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="feeAmount" className="text-xs font-semibold">
                Class Fee Amount ($ / LKR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">$</span>
                <Input
                  id="feeAmount"
                  type="number"
                  min="0"
                  step="1"
                  className="pl-7 h-9 text-sm"
                  value={monthlyFeeAmount}
                  onChange={(e) => setMonthlyFeeAmount(e.target.value)}
                  disabled={cardType === "Free Card"}
                />
              </div>
            </div>

            {/* Payment Month */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="feeMonth" className="text-xs font-semibold">
                  Fee Month
                </Label>
                <button
                  type="button"
                  onClick={() => setCustomMonth(!customMonth)}
                  className="text-[10px] text-primary hover:underline"
                >
                  {customMonth ? "Choose from list" : "Custom month"}
                </button>
              </div>

              {customMonth ? (
                <Input
                  id="feeMonth"
                  placeholder="e.g. October 2026"
                  className="h-9 text-sm"
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(e.target.value)}
                />
              ) : (
                <select
                  id="feeMonth"
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Payment Settlement Date (only active if Paid) */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="payDate" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Settlement Date
              </Label>
              <Input
                id="payDate"
                type="date"
                className="h-9 text-sm"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={paymentStatus !== "Paid"}
              />
              {paymentStatus !== "Paid" && (
                <p className="text-[10px] text-muted-foreground italic">
                  Settlement date is automatically enabled when marked as Paid.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Save Payment Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
