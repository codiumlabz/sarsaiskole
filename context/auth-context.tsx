"use client";

import * as React from "react";
import { User } from "@/types";
import { defaultAdminUser } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "sms_auth_user_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    // Check if user was previously logged in
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to read auth state", e);
    } finally {
      // Simulate realistic initial authentication verify time with skeleton
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Simulated network delay for authentication
    await new Promise((res) => setTimeout(res, 800));

    // Demo admin check: Accept admin credentials or demo fallback
    if (
      (email.toLowerCase() === "admin@school.edu" || email.toLowerCase() === "admin") &&
      pass === "admin123"
    ) {
      const loggedUser = defaultAdminUser;
      setUser(loggedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      return { success: true };
    }

    // Also accept any valid formatted email with password >= 4 chars for testing flexibility
    if (email.includes("@") && pass.length >= 4) {
      const customUser: User = {
        id: "usr-" + Date.now(),
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) + " (Admin)",
        email: email.toLowerCase(),
        role: "admin",
      };
      setUser(customUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid credentials. Use 'admin@school.edu' and password 'admin123', or click 'Fill Demo Credentials'.",
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
