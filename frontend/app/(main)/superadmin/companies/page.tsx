"use client";
import RoleGuard from "@/components/guards/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import EditOrganizationModal from "@/components/organizations/EditOrganizationModal";

import { useRouter } from "next/navigation";

export default function CompaniesPage() {
    const { user } = useAuth();
    const router = useRouter();

    interface Organization {
        id: number;
        name: string;
        slug: string;
    }

    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleDelete = async (orgId: number) => {
        if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/organizations/${orgId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setRefreshTrigger(prev => prev + 1);
            } else {
                const data = await res.json();
                alert(data.detail || 'Failed to delete organization');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    useEffect(() => {
        async function fetchOrgs() {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/organizations`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store'
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrgs(data);
                }
            } catch (error) {
                console.error("Failed to fetch organizations", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrgs();
    }, [refreshTrigger]);

    return (
        <RoleGuard allowedRoles={['super_admin']}>
            <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text">Companies</h1>
                        <p className="text-gray-600 dark:text-reddit-meta">Manage active organizations</p>
                    </div>
                    <button
                        onClick={() => setIsOrgModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                        <span>+ Create Organization</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading organizations...</div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-500">ID</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Slug</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {orgs.length > 0 ? (
                                    orgs.map((org) => (
                                        <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">#{org.id}</td>
                                            <td className="px-4 py-3 font-medium">{org.name}</td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{org.slug}</td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/superadmin/companies/${org.id}`)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                                                >
                                                    Manage
                                                </button>
                                                <button
                                                    onClick={() => setEditingOrg(org)}
                                                    className="text-gray-600 hover:text-gray-800 text-xs font-bold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(org.id)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            No organizations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <CreateOrganizationModal
                    isOpen={isOrgModalOpen}
                    onClose={() => setIsOrgModalOpen(false)}
                    onSuccess={() => {
                        setTimeout(() => {
                            setRefreshTrigger(prev => prev + 1);
                        }, 300);
                    }}
                />

                <EditOrganizationModal
                    isOpen={!!editingOrg}
                    onClose={() => setEditingOrg(null)}
                    onSuccess={() => {
                        setTimeout(() => {
                            setRefreshTrigger(prev => prev + 1);
                        }, 300);
                    }}
                    org={editingOrg}
                />
            </div>
        </RoleGuard>
    );
}
