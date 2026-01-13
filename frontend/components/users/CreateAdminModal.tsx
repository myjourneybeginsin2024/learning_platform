"use client";
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CreateAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateAdminModal({ isOpen, onClose, onSuccess }: CreateAdminModalProps) {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgId, setOrgId] = useState<string>('');
    const [organizations, setOrganizations] = useState<{ id: number, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            fetchOrganizations();
        }
        return () => setMounted(false);
    }, [isOpen]);

    const fetchOrganizations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/organizations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrganizations(data);
            }
        } catch (error) {
            console.error("Failed to fetch organizations", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/superadmin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    password,
                    role: 'admin', // Force role to admin
                    is_active: true,
                    organization_id: orgId ? parseInt(orgId) : undefined
                })
            });

            if (res.ok) {
                setEmail('');
                setPassword('');
                setOrgId('');
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.detail || 'Failed to create admin');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1B] w-full md:max-w-md max-h-[80vh] flex flex-col rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create New Administrator</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Assign to Organization (Optional)
                            </label>
                            <select
                                value={orgId}
                                onChange={(e) => setOrgId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Select an organization...</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                The user will be added as an Admin to this organization.
                            </p>
                        </div>

                        {/* Spacing for mobile scroll */}
                        <div className="h-4 md:hidden"></div>
                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#1A1A1B]">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 md:py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-4 py-3 md:py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
