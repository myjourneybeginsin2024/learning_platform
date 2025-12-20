"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, getCurrentUser } from "@/lib/auth"; // ← ADD getCurrentUser

type User = { id: number; email: string; role: string;  };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On page load, check if token exists and fetch user
    const token = localStorage.getItem("token"); // We'll store token temporarily in localStorage for persistence
    if (token) {
      getCurrentUser(token)
        .then((user) => {
          setUser({
          id: user.id,
          email: user.email,
          role: user.role, // ← ADD THIS
          });
        })
        .catch(() => localStorage.removeItem("token")); // Clear invalid token
    }
  }, []);

  async function loginUser(email: string, password: string) {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.access_token); // Persist token
    const user = await getCurrentUser(data.access_token);
    setUser({
     id: user.id,
     email: user.email,
     role: user.role, // ← ADD THIS
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
