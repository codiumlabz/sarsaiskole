"use client";

import * as React from "react";
import { Student, Subject } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, UserCheck, Layers, TrendingUp } from "lucide-react";

interface StatCardsProps {
  students: Student[];
  subjects: Subject[];
  isLoading: boolean;
}

export function StatCards({ students, subjects, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="p-4 border-border/80">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const totalSubjects = subjects.length;

  const totalEnrollments = students.reduce(
    (acc, s) => acc + (s.enrolledSubjectIds?.length || 0),
    0
  );

  const uniqueDepartments = new Set(subjects.map((s) => s.department)).size;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      subtext: `${activeStudents} currently active`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      badge: "+12% this term",
    },
    {
      title: "Active Status Rate",
      value: totalStudents > 0 ? `${Math.round((activeStudents / totalStudents) * 100)}%` : "0%",
      subtext: `${students.filter((s) => s.status !== "Active").length} inactive/graduated`,
      icon: UserCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      badge: "Healthy status",
    },
    {
      title: "Curriculum Subjects",
      value: totalSubjects.toString(),
      subtext: `Across ${uniqueDepartments || 4} departments`,
      icon: BookOpen,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      badge: "Fully accredited",
    },
    {
      title: "Total Course Enrollments",
      value: totalEnrollments.toString(),
      subtext: "Assigned class seats",
      icon: Layers,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      badge: "Active courses",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className="relative overflow-hidden border-border/80 shadow-sm hover:shadow-md transition-all hover:border-primary/40 group"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </p>
                <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{stat.subtext}</span>
                  <span className="flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    {stat.badge}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
