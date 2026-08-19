"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  LogOut,
  Sparkles,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  onResetData: () => void;
  isLoading: boolean;
  onToggleLoadingSim: () => void;
}

export function DashboardHeader({
  onResetData,
  isLoading,
  onToggleLoadingSim,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully.");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-foreground">
                Sarsa Iskole
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Student Information & Subject Management System
            </p>
          </div>
        </div>

        {/* Right Actions: Skeleton toggle, Demo reset, Theme toggle, User Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Skeleton simulation button */}
          <Button
            variant={isLoading ? "default" : "outline"}
            size="sm"
            onClick={onToggleLoadingSim}
            className="text-xs h-9 hidden md:flex items-center gap-1.5"
            title="Toggle loading skeleton state to test UX"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isLoading ? "Showing Skeleton..." : "Simulate Skeleton"}
          </Button>

          {/* Reset Demo Data */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onResetData}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Reset to default demo data"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset Data</span>
          </Button>

          {/* Theme Switcher */}
          <ThemeToggle />

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* User Info & Logout */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 border border-border bg-primary/10 text-primary">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-foreground flex items-center gap-1">
                  {user?.name || "Administrator"}
                  <UserCheck className="h-3 w-3 text-emerald-500" />
                </div>
                <div className="text-muted-foreground font-mono text-[10px]">
                  {user?.email || "admin@school.edu"}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80"
              title="Logout from administrative console"
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
