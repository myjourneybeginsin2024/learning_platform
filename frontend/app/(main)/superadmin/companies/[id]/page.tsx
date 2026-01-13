"use client";
import RoleGuard from "@/components/guards/RoleGuard";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';

export default function CompanyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    interface Member {
        id: number;
        email: string;
        role: string;
    }

    interface OrganizationDetails {
        id: number;
        name: string;
        slug: string;
        members: Member[];
    }

    const [org, setOrg] = useState<OrganizationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [addingError, setAddingError] = useState('');
    const [addingLoading, setAddingLoading] = useState(false);

    async function fetchOrg() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/organizations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrg(data);
            }
        } catch (error) {
            console.error("Failed to fetch organization", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) fetchOrg();
    }, [id]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingLoading(true);
        setAddingError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/organizations/${id}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_email: newUserEmail,
                    role: 'admin' // Explicitly adding as admin
                })
            });

            if (res.ok) {
                setNewUserEmail('');
                fetchOrg(); // Refresh list
            } else {
                const data = await res.json();
                setAddingError(data.detail || 'Failed to add admin');
            }
        } catch (err) {
            setAddingError('An error occurred');
        } finally {
            setAddingLoading(false);
        }
    };

    const handleRemoveUser = async (userId: number, email: string) => {
        if (!confirm(`Are you sure you want to remove ${email} from this organization?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/organizations/${id}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchOrg(); // Refresh list
            } else {
                alert('Failed to remove user');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    return (
        <RoleGuard allowedRoles={['super_admin']}>
            <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text">
                            {loading ? 'Loading...' : org?.name}
                        </h1>
                        <p className="text-gray-600 dark:text-reddit-meta">Organization Management</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading details...</div>
                ) : (
                    <div className="space-y-8">
                        {/* Top Section: Details & Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-lg mb-4">Organization Info</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Organization ID</label>
                                        <p className="font-mono text-sm">#{org?.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Slug</label>
                                        <p className="font-mono text-sm">{org?.slug}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Total Members</label>
                                        <p className="font-mono text-sm">{org?.members.length} Users</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 p-6 bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold text-lg mb-4">Current Administrators</h3>
                                {org?.members.filter(m => m.role === 'admin').length === 0 ? (
                                    <p className="text-gray-500 italic">No administrators assigned yet.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {org?.members.filter(m => m.role === 'admin').map(admin => (
                                            <div key={admin.id} className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm border border-purple-100 dark:border-purple-800 group">
                                                <span>{admin.email}</span>
                                                <button
                                                    onClick={() => handleRemoveUser(admin.id, admin.email)}
                                                    className="ml-2 p-1 bg-white dark:bg-black/20 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-500 border border-purple-100 dark:border-purple-800 hover:border-red-200 transition-colors"
                                                    title="Remove from organization"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Available Admins Section */}
                        <div>
                            <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                                <span>Available Administrators</span>
                                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                    Users with 'admin' role not in this org
                                </span>
                            </h3>
                            <AvailableAdminsTable orgId={id as string} onAdd={() => fetchOrg()} />
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}

function AvailableAdminsTable({ orgId, onAdd }: { orgId: string, onAdd: () => void }) {
    const [admins, setAdmins] = useState<{ id: number, email: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);

    useEffect(() => {
        fetchAvailableAdmins();
    }, [orgId]);

    const fetchAvailableAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/organizations/${orgId}/available-admins`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (userEmail: string, userId: number) => {
        setAssigningId(userId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/organizations/${orgId}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_email: userEmail,
                    role: 'admin'
                })
            });

            if (res.ok) {
                onAdd(); // Refresh parent
                fetchAvailableAdmins(); // Refresh self
            } else {
                alert('Failed to assign admin');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setAssigningId(null);
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Loading available admins...</div>;

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                        <th className="px-4 py-3 font-medium text-gray-500 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {admins.length > 0 ? (
                        admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-medium">{admin.email}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handleAssign(admin.email, admin.id)}
                                        disabled={assigningId === admin.id}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-bold disabled:opacity-50"
                                    >
                                        {assigningId === admin.id ? 'Assigning...' : '+ Assign to Organization'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                                No available admins found. All system admins are already assigned to this organization.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
