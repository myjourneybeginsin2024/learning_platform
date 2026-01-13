"use client";
import RoleGuard from "@/components/guards/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const adminOrgs = user?.organizations?.filter(o => o.role === 'admin') || [];

  useEffect(() => {
    // If user manages only one organization, redirect them straight to the dashboard
    if (adminOrgs.length === 1) {
      router.replace(`/admin/org/${adminOrgs[0].id}`);
    }
  }, [adminOrgs, router]);

  return (
    <RoleGuard allowedRoles={['org_admin']}>
      <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text mb-4">Organization Dashboard</h1>

        {adminOrgs.length > 0 ? (
          <div className="grid gap-4 mt-6">
            {adminOrgs.map(org => (
              <div key={org.id} className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-[#1A1A1B]">
                <h3 className="text-lg font-bold">{org.name}</h3>
                <p className="text-sm text-gray-500">Slug: {org.slug}</p>
                <Link href={`/admin/org/${org.id}`} className="mt-2 text-blue-600 hover:underline font-medium inline-block">
                  Manage Organization
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">You are not an admin of any organization yet.</p>
        )}
      </div>
    </RoleGuard>
  );
}
