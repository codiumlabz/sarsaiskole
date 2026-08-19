"use client";

import * as React from "react";
import { Student, Subject } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  BookPlus,
  BookOpen,
  Search,
  Users,
  Clock,
  MapPin,
  User,
  Edit2,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface SubjectManagerProps {
  subjects: Subject[];
  students: Student[];
  isLoading: boolean;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export function SubjectManager({
  subjects,
  students,
  isLoading,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: SubjectManagerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("ALL");
  const [subjectToDelete, setSubjectToDelete] = React.useState<Subject | null>(null);

  // Map enrolled student count per subject
  const enrolledCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    subjects.forEach((sub) => map.set(sub.id, 0));
    students.forEach((stu) => {
      stu.enrolledSubjectIds.forEach((subId) => {
        map.set(subId, (map.get(subId) || 0) + 1);
      });
    });
    return map;
  }, [subjects, students]);

  // Unique departments for filter
  const departments = React.useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => set.add(s.department));
    return Array.from(set);
  }, [subjects]);

  const filteredSubjects = React.useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch =
        searchTerm === "" ||
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.teacher.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        deptFilter === "ALL" || subject.department === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [subjects, searchTerm, deptFilter]);

  const confirmDelete = () => {
    if (subjectToDelete) {
      onDeleteSubject(subjectToDelete.id);
      toast.success(`Subject "${subjectToDelete.code} - ${subjectToDelete.name}" removed.`);
      setSubjectToDelete(null);
    }
  };

  const getDeptBadgeColor = (dept: string) => {
    switch (dept) {
      case "Computer Science":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "Mathematics":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      case "Science":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "Humanities":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects by code, course name, instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Add Subject Setup Button */}
          <Button onClick={onAddSubject} className="h-10 gap-1.5 shadow-sm">
            <BookPlus className="h-4 w-4" />
            <span>Setup Subject</span>
          </Button>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="p-5 space-y-3 border-border/80">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-2 border-t border-border space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-3 opacity-40 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">No subjects found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {searchTerm || deptFilter !== "ALL"
                ? "No curriculum subjects match your search criteria. Try adjusting your query."
                : "No subjects have been configured yet. Click 'Setup Subject' to add your first course."}
            </p>
            <Button
              onClick={onAddSubject}
              className="mt-4 gap-1.5"
            >
              <BookPlus className="h-4 w-4" />
              Setup New Subject
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => {
            const count = enrolledCountMap.get(subject.id) || 0;
            return (
              <Card
                key={subject.id}
                className="group relative overflow-hidden border-border/80 bg-card hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                      {subject.code}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getDeptBadgeColor(
                        subject.department
                      )}`}
                    >
                      {subject.department}
                    </span>
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {subject.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {subject.description || "Comprehensive course module focusing on foundational skills."}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  {/* Instructor & Location info */}
                  <div className="space-y-1.5 text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{subject.teacher}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {subject.schedule || "Mon/Wed"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {subject.room || "Main Campus"}
                      </span>
                    </div>
                  </div>

                  {/* Footer Meta: Enrolled count & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {count} {count === 1 ? "student" : "students"}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {subject.credits} Credits
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => onEditSubject(subject)}
                        title="Edit Subject"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setSubjectToDelete(subject)}
                        title="Delete Subject"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      <Dialog
        open={!!subjectToDelete}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold">
                Delete Subject Setup
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm text-foreground/80">
              Are you sure you want to remove{" "}
              <strong className="text-foreground font-semibold">
                {subjectToDelete?.code} - {subjectToDelete?.name}
              </strong>
              ?
              {subjectToDelete && (enrolledCountMap.get(subjectToDelete.id) || 0) > 0 && (
                <div className="mt-2 p-2.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs">
                  <strong>Warning:</strong> {enrolledCountMap.get(subjectToDelete.id)} students are
                  currently enrolled in this subject. Deleting it will remove the course from their schedule.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSubjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
