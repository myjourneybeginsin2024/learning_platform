'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Plus, Search, Trash2, User as UserIcon } from 'lucide-react';

type OrgUser = {
    id: number;
    email: string;
    full_name?: string;
    role: 'admin' | 'member';
    joined_at?: string;
};

import RoleGuard from '@/components/guards/RoleGuard';


import { AddEmployeeModal } from '@/components/organizations/AddEmployeeModal';

export default function OrgEmployeesPage() {
    const params = useParams();
    const orgId = params?.id as string;
    const { user } = useAuth();
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (orgId) {
            loadUsers();
        }
    }, [orgId]);

    async function loadUsers() {
        try {
            setIsLoading(true);
            const res = await apiFetch(`/admin/organizations/${orgId}/users`);
            setUsers(res);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRemoveUser(userId: number) {
        if (!confirm("Are you sure you want to remove this user from the organization?")) return;

        try {
            await apiFetch(`/admin/organizations/${orgId}/users/${userId}`, {
                method: 'DELETE'
            });
            // Optimistic update or reload
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert("Failed to remove user.");
            console.error(err);
        }
    }

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        const emailMatch = u.email.toLowerCase().includes(query);
        const nameMatch = u.full_name ? u.full_name.toLowerCase().includes(query) : false;
        return emailMatch || nameMatch;
    });

    console.log("Users:", users);
    console.log("Filtered Users:", filteredUsers);

    return (
        <RoleGuard allowedRoles={['org_admin']}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage access and roles for your organization members.</p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1B] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#1A1A1B] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name / Email</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Role</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading employees...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No employees found.</td></tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{u.full_name || 'N/A'}</div>
                                                    <div className="text-gray-500 dark:text-gray-400">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {u.joined_at ? new Date(u.joined_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.id !== user?.id && (
                                                <button
                                                    onClick={() => handleRemoveUser(u.id)}
                                                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Remove User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={loadUsers}
                orgId={orgId}
            />
        </RoleGuard>
    );
}
