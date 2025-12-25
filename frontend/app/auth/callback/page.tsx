"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Get URL parameters from the current location
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("access_token");
    const tokenType = urlParams.get("token_type");

    if (token && tokenType === "bearer") {
      // Store the token in localStorage
      localStorage.setItem("token", token);
      
      // Wait a brief moment to ensure the AuthContext picks up the change
      // and then redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } else {
      // If no token, redirect to login
      router.push("/login");
    }
  }, [router]);

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Processing authentication...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we complete your login.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}