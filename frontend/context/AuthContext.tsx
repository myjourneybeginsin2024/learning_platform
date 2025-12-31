"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "@/lib/auth";

type User = { id: number; email: string; role: string; };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<User>;
  registerUser: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const fetchedUser = await getCurrentUser(token);
        setUser({ id: fetchedUser.id, email: fetchedUser.email, role: fetchedUser.role });
        localStorage.setItem('user_role', fetchedUser.role);
        console.log("AuthContext: user initialized", fetchedUser);
      } catch (error) {
        console.error("AuthContext: initializeAuth failed", error);
        console.log("AuthContext: Removing token due to error. Token was:", token);
        localStorage.removeItem("token");
        localStorage.removeItem("user_role");
        setUser(null);
      }
    } else {
      console.log("AuthContext: No token found in localStorage");
    }
    setInitialized(true);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  async function loginUser(email: string, password: string): Promise<User> {
    // 1. Get combined data from backend
    const data = await apiLogin(email, password);

    // 2. Persist token
    localStorage.setItem("token", data.access_token);

    // 3. Set user state immediately from response
    const userProfile: User = data.user;
    setUser(userProfile);
    localStorage.setItem('user_role', userProfile.role);

    // 4. Return to LoginPage for immediate redirection
    return userProfile;
  }

  async function registerUser(email: string, password: string) {
    try {
      await apiRegister(email, password);
      await loginUser(email, password);
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }

  async function loginWithToken(token: string): Promise<User> {
    console.log("AuthContext: loginWithToken called with token", token);
    localStorage.setItem("token", token);
    try {
      const fetchedUser = await getCurrentUser(token);
      console.log("AuthContext: user fetched", fetchedUser);
      setUser({ id: fetchedUser.id, email: fetchedUser.email, role: fetchedUser.role });
      // Ensure role is saved for ProtectedRoute
      localStorage.setItem('user_role', fetchedUser.role);
      return fetchedUser;
    } catch (err) {
      console.error("AuthContext: fetch user failed", err);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push('/');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: !initialized,
        loginUser,
        registerUser,
        loginWithToken,
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
