'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { X } from 'lucide-react';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orgId: string;
    employee: {
        id: number;
        full_name: string;
        email: string; // Not editable, but shown for context
    } | null;
}

export function EditEmployeeModal({ isOpen, onClose, onSuccess, orgId, employee }: EditEmployeeModalProps) {
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (employee) {
            setFullName(employee.full_name || '');
            setPassword(''); // Always reset password field
        }
    }, [employee, isOpen]);

    if (!isOpen || !employee) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await apiFetch(`/admin/organizations/${orgId}/users/${employee.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    full_name: fullName,
                    password: password || undefined // Only send if not empty
                })
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to update user.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1B] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Employee</h2>
                <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Editing: <span className="text-gray-900 dark:text-white">{employee.email}</span></p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password (Optional)
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Leave blank to keep unchanged"
                        />
                        <p className="text-xs text-gray-500 mt-1">Only enter a new password if you want to change it.</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
