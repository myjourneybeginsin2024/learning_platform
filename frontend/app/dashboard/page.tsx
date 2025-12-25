"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Wrap the dashboard content with ProtectedRoute to ensure authentication
  return (
    <ProtectedRoute requireAuth={true}>
      <div style={{ padding: "2rem" }}>
        <h1>Dashboard</h1>
        <p>Logged in as: {user?.email}</p>
        <button 
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </ProtectedRoute>
  );
}