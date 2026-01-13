"use client";
import RoleGuard from "@/components/guards/RoleGuard";
import { useEffect, useState } from "react";
import CreateAdminModal from "@/components/users/CreateAdminModal";
import EditUserModal from "@/components/users/EditUserModal";
import { UserPlus } from 'lucide-react';

export default function AdminsPage() {
    interface OrganizationMini {
        id: number;
        name: string;
    }

    interface UserData {
        id: number;
        email: string;
        is_active: boolean;
        role: string;
        organizations?: OrganizationMini[];
    }

    const [admins, setAdmins] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    async function fetchAdmins() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/users?role=admin`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to remove this admin? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchAdmins();
            } else {
                alert('Failed to delete admin');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    return (
        <RoleGuard allowedRoles={['super_admin']}>
            <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text">Manage Admins</h1>
                        <p className="text-gray-600 dark:text-reddit-meta">Oversee platform administrators</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Admin</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading admins...</div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-500">ID</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Company</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {admins.length > 0 ? (
                                    admins.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">#{u.id}</td>
                                            <td className="px-4 py-3 font-medium">{u.email}</td>
                                            <td className="px-4 py-3">
                                                {u.organizations && u.organizations.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.organizations.map(org => (
                                                            <span key={org.id} className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                                {org.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setEditingUser(u)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No administrators found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <CreateAdminModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => fetchAdmins()}
                />

                <EditUserModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => fetchAdmins()}
                    user={editingUser}
                />
            </div>
        </RoleGuard>
    );
}
