"use client";
import RoleGuard from "@/components/guards/RoleGuard";
import { useEffect, useState } from "react";

export default function SuperAdminDashboard() {
  interface SystemStats {
    total_organizations: number;
    total_admins: number;
    total_users: number;
  }

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:!bg-[#1A1A1B] rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-reddit-text mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-reddit-meta text-lg">
            Welcome back. Here is the system overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Organizations Card */}
          <div className="bg-white dark:!bg-[#1A1A1B] p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536] relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-bold text-blue-600">O</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-wider mb-2">Total Organizations</h3>
              {loading ? (
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              ) : (
                <p className="text-5xl font-extrabold text-slate-900 dark:text-white">{stats?.total_organizations || 0}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Active companies on platform</p>
            </div>
          </div>

          {/* Admins Card */}
          <div className="bg-white dark:!bg-[#1A1A1B] p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536] relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-bold text-purple-600">A</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-purple-600 dark:text-purple-400 font-bold uppercase text-xs tracking-wider mb-2">Total Admins</h3>
              {loading ? (
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              ) : (
                <p className="text-5xl font-extrabold text-slate-900 dark:text-white">{stats?.total_admins || 0}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Organization administrators</p>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white dark:!bg-[#1A1A1B] p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536] relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-bold text-green-600">U</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-green-600 dark:text-green-400 font-bold uppercase text-xs tracking-wider mb-2">Total Users</h3>
              {loading ? (
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
              ) : (
                <p className="text-5xl font-extrabold text-slate-900 dark:text-white">{stats?.total_users || 0}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Registered global users</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
