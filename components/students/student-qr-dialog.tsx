"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
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
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Copy,
  ExternalLink,
  Check,
  Download,
  CreditCard,
  BookOpen,
  ShieldCheck,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

interface StudentQrDialogProps {
  student: Student | null;
  subjects: Subject[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isNewlyCreated?: boolean;
}

export function StudentQrDialog({
  student,
  subjects,
  open,
  onOpenChange,
  isNewlyCreated = false,
}: StudentQrDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [origin, setOrigin] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!student) return null;

  const verificationUrl = `${origin}/verify/${student.id}`;
  const enrolledSubjects = subjects.filter((s) =>
    student.enrolledSubjectIds.includes(s.id)
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("student-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${student.studentId}_${student.name.replace(/\s+/g, "_")}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QR Code downloaded as PNG!");
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const getPaymentBadge = () => {
    switch (student.paymentStatus) {
      case "Paid":
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            <Check className="h-3 w-3" /> Paid (This Month)
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="warning" className="gap-1 font-semibold">
            Payment Pending
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="destructive" className="gap-1 font-semibold">
            Payment Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">Unspecified</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 text-center">
        <DialogHeader className="text-center sm:text-center pb-2">
          {isNewlyCreated && (
            <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Student Registered Successfully
            </div>
          )}
          <DialogTitle className="text-xl font-bold flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Student Verification QR Pass
          </DialogTitle>
          <DialogDescription className="text-xs">
            Scan this QR code with any smartphone to instantly check student details, enrolled classes, and monthly payment status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 my-2">
          {/* QR Code Container with sleek border & card */}
          <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-md inline-block relative group">
            <QRCodeSVG
              id="student-qr-svg"
              value={verificationUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Student Quick Meta */}
          <div className="w-full bg-muted/40 rounded-xl p-3 border border-border text-left space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">{student.name}</h4>
                <p className="text-xs font-mono text-muted-foreground">{student.studentId} • {student.grade}</p>
              </div>
              <div>{getPaymentBadge()}</div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                {enrolledSubjects.length} Enrolled {enrolledSubjects.length === 1 ? "Class" : "Classes"}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                {student.paymentMonth || "Current Month"}
              </span>
            </div>
          </div>

          {/* Link box with Copy Button */}
          <div className="w-full flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-lg border border-border">
            <span className="text-[11px] font-mono text-muted-foreground truncate px-2 flex-1 text-left">
              {verificationUrl}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs shrink-0"
              title="Copy verification URL"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="w-full sm:w-auto text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download QR
          </Button>

          <Button
            size="sm"
            onClick={() => window.open(verificationUrl, "_blank")}
            className="w-full sm:w-auto text-xs gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Phone View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
