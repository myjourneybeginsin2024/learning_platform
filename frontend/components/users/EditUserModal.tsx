"use client";
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

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

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: UserData | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
    const [mounted, setMounted] = useState(false);
    const [role, setRole] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedOrgIds, setSelectedOrgIds] = useState<number[]>([]);

    const [allOrganizations, setAllOrganizations] = useState<OrganizationMini[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            fetchOrganizations();
        }
        return () => setMounted(false);
    }, [isOpen]);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setIsActive(user.is_active);
            setEmail(user.email);
            setPassword('');
            // Pre-select organizations
            if (user.organizations) {
                setSelectedOrgIds(user.organizations.map(o => o.id));
            } else {
                setSelectedOrgIds([]);
            }
        }
    }, [user]);

    const fetchOrganizations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/organizations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAllOrganizations(data);
            }
        } catch (error) {
            console.error("Failed to fetch organizations", error);
        }
    };

    const toggleOrgSelection = (orgId: number) => {
        setSelectedOrgIds(prev => {
            if (prev.includes(orgId)) {
                return prev.filter(id => id !== orgId);
            } else {
                return [...prev, orgId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    role,
                    is_active: isActive,
                    email,
                    password: password.length > 0 ? password : undefined,
                    organization_ids: role === 'admin' ? selectedOrgIds : [] // Only send orgs if role is admin
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.detail || 'Failed to update user');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || !isOpen || !user) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1B] w-full max-w-lg rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-800 flex flex-col max-h-[80vh]">

                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A1A1B] rounded-t-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit User</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password (Optional)
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        {/* Organization Selector - Only show if role is Admin */}
                        {role === 'admin' && (
                            <div className="space-y-2 border-t border-b border-gray-100 dark:border-gray-800 py-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                    Assign to Organizations
                                </label>
                                <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-800">
                                    {allOrganizations.length === 0 ? (
                                        <p className="text-xs text-gray-500 text-center">No organizations found.</p>
                                    ) : (
                                        allOrganizations.map(org => (
                                            <label key={org.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrgIds.includes(org.id)}
                                                    onChange={() => toggleOrgSelection(org.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{org.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">Select which organizations this user manages.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={isActive}
                                        onChange={() => setIsActive(true)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!isActive}
                                        onChange={() => setIsActive(false)}
                                        className="text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">Inactive</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1A1B]/50 rounded-b-lg flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-user-form"
                        disabled={loading}
                        className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}
