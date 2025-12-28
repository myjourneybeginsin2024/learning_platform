"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "@/lib/auth";

type User = { id: number; email: string; role: string; };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const initializeAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('auth_token') || urlParams.get('access_token');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const fetchedUser = await getCurrentUser(token);
        setUser({ id: fetchedUser.id, email: fetchedUser.email, role: fetchedUser.role });
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setInitialized(true);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  async function loginUser(email: string, password: string) {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.access_token);
    const userData = await getCurrentUser(data.access_token);
    setUser({ id: userData.id, email: userData.email, role: userData.role });
  }

  async function registerUser(email: string, password: string) {
    try {
      await apiRegister(email, password);
      // Automatically log the user in after registration
      await loginUser(email, password);
    } catch (error: any) {
      throw new Error(error.message || "Registration/Login failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: !initialized,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {initialized ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
