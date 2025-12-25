"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "@/lib/auth"; // ← ADD getCurrentUser

type User = { id: number; email: string; role: string; };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false); // Track initialization

  useEffect(() => {
    // Check for token immediately when component mounts
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser(token)
        .then((fetchedUser) => {
          setUser({
          id: fetchedUser.id,
          email: fetchedUser.email,
          role: fetchedUser.role, // ← ADD THIS
          });
        })
        .catch(() => localStorage.removeItem("token")); // Clear invalid token
    }
    
    // Listen for storage events to update auth state when token is set from other pages/tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token was added/updated
          getCurrentUser(e.newValue)
            .then((fetchedUser) => {
              setUser({
                id: fetchedUser.id,
                email: fetchedUser.email,
                role: fetchedUser.role,
              });
            })
            .catch(() => {
              localStorage.removeItem("token");
              setUser(null);
            });
        } else {
          // Token was removed
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set initialized to true after setting up listeners
    setInitialized(true);
    
    // Clean up the event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Effect to handle route protection after initialization
  useEffect(() => {
    if (initialized && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthenticated = !!user;
      
      // If user is authenticated and on dashboard but tries to navigate away
      if (isAuthenticated && currentPath !== '/dashboard' && !currentPath.startsWith('/dashboard') && 
          !currentPath.startsWith('/auth/') && 
          currentPath !== '/' && 
          !currentPath.startsWith('/login') && 
          !currentPath.startsWith('/register')) {
        window.location.href = '/dashboard';
      }
    }
  }, [user, initialized]);

  // Effect to monitor location changes and enforce navigation rules
  useEffect(() => {
    if (!user) return; // Only run if user is authenticated
    
    let currentPath = window.location.pathname;
    
    // Monitor for URL changes by checking location periodically
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        // Location changed
        const newPath = window.location.pathname;
        currentPath = newPath;
        
        // If user is authenticated and tries to navigate away from dashboard
        if (user && newPath !== '/dashboard' && !newPath.startsWith('/dashboard') && 
            !newPath.startsWith('/auth/')) {
          // Redirect back to dashboard
          window.location.href = '/dashboard';
        }
      }
    }, 100); // Check every 100ms
    
    // Also listen for popstate (browser back/forward buttons)
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (user && currentPath !== '/dashboard' && !currentPath.startsWith('/dashboard') && 
          !currentPath.startsWith('/auth/')) {
        window.location.href = '/dashboard';
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Clean up
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user]);

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

  async function registerUser(email: string, password: string) {
    const data = await apiRegister(email, password);
    // After registration, log the user in automatically
    const loginData = await apiLogin(email, password);
    localStorage.setItem("token", loginData.access_token); // Persist token
    const userData = await getCurrentUser(loginData.access_token);
    setUser({
     id: userData.id,
     email: userData.email,
     role: userData.role,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginUser,
        registerUser,
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