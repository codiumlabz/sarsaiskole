"use client";

import * as React from "react";
import { Subject } from "@/types";
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
import { BookPlus, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSubject: (subject: Subject) => void;
  initialData?: Subject | null;
}

export function AddSubjectDialog({
  open,
  onOpenChange,
  onSaveSubject,
  initialData,
}: AddSubjectDialogProps) {
  const isEditing = !!initialData;

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [department, setDepartment] = React.useState("Computer Science");
  const [teacher, setTeacher] = React.useState("");
  const [schedule, setSchedule] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setDepartment(initialData.department);
        setTeacher(initialData.teacher);
        setSchedule(initialData.schedule || "");
        setDescription(initialData.description || "");
      } else {
        setCode("");
        setName("");
        setDepartment("Computer Science");
        setTeacher("");
        setSchedule("Mon/Wed 10:00 - 11:30 AM");
        setDescription("");
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!code.trim()) newErrors.code = "Subject code is required (e.g. CS101)";
    if (!name.trim()) newErrors.name = "Subject name is required";
    if (!teacher.trim()) newErrors.teacher = "Assigned instructor name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const subjectToSave: Subject = {
      id: initialData?.id || `sub-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      department,
      teacher: teacher.trim(),
      schedule: schedule.trim() || undefined,
      description: description.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSaveSubject(subjectToSave);
    toast.success(
      isEditing
        ? `Subject "${subjectToSave.code} - ${subjectToSave.name}" updated!`
        : `Subject "${subjectToSave.code} - ${subjectToSave.name}" created!`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {isEditing ? <BookOpen className="h-5 w-5" /> : <BookPlus className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Subject Setup" : "Setup New Subject"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update course curriculum details, teacher, and schedule."
                  : "Add a new course or subject to the academic curriculum."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold">
                Subject Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g. CS102 / MATH301"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
                }}
                className={`font-mono ${errors.code ? "border-destructive" : ""}`}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-semibold">
                Academic Department
              </Label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Computer Science">Computer Science & IT</option>
                <option value="Mathematics">Mathematics & Statistics</option>
                <option value="Science">Physical & Natural Sciences</option>
                <option value="Humanities">Humanities & Languages</option>
                <option value="Business">Business & Economics</option>
                <option value="Arts">Fine Arts & Design</option>
              </select>
            </div>

            {/* Subject Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold">
                Subject / Course Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Data Structures and Algorithms"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Teacher / Instructor */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="teacher" className="text-xs font-semibold">
                Assigned Instructor / Teacher <span className="text-destructive">*</span>
              </Label>
              <Input
                id="teacher"
                placeholder="e.g. Prof. Grace Hopper"
                value={teacher}
                onChange={(e) => {
                  setTeacher(e.target.value);
                  if (errors.teacher) setErrors((prev) => ({ ...prev, teacher: "" }));
                }}
                className={errors.teacher ? "border-destructive" : ""}
              />
              {errors.teacher && <p className="text-xs text-destructive">{errors.teacher}</p>}
            </div>

            {/* Schedule */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="schedule" className="text-xs font-semibold">
                Weekly Class Schedule
              </Label>
              <Input
                id="schedule"
                placeholder="e.g. Tue/Thu 09:00 - 10:30 AM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="desc" className="text-xs font-semibold">
                Course Description
              </Label>
              <textarea
                id="desc"
                rows={3}
                placeholder="Overview of curriculum objectives, prerequisites, and learning outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
