"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginCard() {
  const { login, isLoading: authChecking } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome back! Logged in as Administrator.");
      } else {
        setErrorMessage(res.error || "Login failed. Please try again.");
        toast.error(res.error || "Login failed.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@school.edu");
    setPassword("admin123");
    setErrorMessage(null);
    toast.info("Demo administrator credentials filled in.");
  };

  if (authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-md shadow-xl border-border/80 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md z-10 space-y-4">
        {/* Brand identity header */}
        <div className="text-center space-y-2 mb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-2">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sarsa Iskole
          </h1>
          <p className="text-sm text-muted-foreground">
            Student & Academic Administration Portal
          </p>
        </div>

        <Card className="shadow-2xl border-border bg-card/95 backdrop-blur-md">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Admin Login</CardTitle>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="h-3 w-3" /> Secure Access
              </span>
            </div>
            <CardDescription>
              Sign in with your administrator credentials to manage students and subjects.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in-50">
                {errorMessage}
              </div>
            )}

            {/* Quick Demo Credentials Autofill Banner */}
            <div className="p-3 rounded-lg bg-muted/60 border border-border flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div className="font-medium text-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Quick Testing
                </div>
                <div>Demo Admin: <code className="text-foreground font-mono text-[11px]">admin@school.edu</code></div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 bg-background hover:bg-accent"
                onClick={handleFillDemo}
              >
                Auto Fill
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">admin123</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-medium h-10 mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 text-center justify-center border-t border-border/50 py-3">
            <p className="text-xs text-muted-foreground">
              Protected by role-based academic administration security.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
