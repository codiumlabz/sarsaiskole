"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9 opacity-50" aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-lg border-border bg-card hover:bg-muted transition-colors relative"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark and light mode"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-[1.15rem] w-[1.15rem] text-amber-400 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem] text-slate-700 transition-transform rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
