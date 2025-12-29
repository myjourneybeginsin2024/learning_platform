"use client";
import { useAuth } from "@/context/AuthContext";

export default function UserHeader() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-slate-800 text-white shadow-md">
      <div className="flex gap-4 items-center">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Logged in as:</span>
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
        <div className="px-2 py-1 rounded bg-blue-600 text-[10px] uppercase font-bold">
          {user?.role}
        </div>
      </div>
      <button 
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
      >
        Logout
      </button>
    </nav>
  );
}
