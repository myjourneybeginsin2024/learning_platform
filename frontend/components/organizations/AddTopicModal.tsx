'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { X, BookOpen } from 'lucide-react';

interface AddTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orgId: string;
}

export function AddTopicModal({ isOpen, onClose, onSuccess, orgId }: AddTopicModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await apiFetch(`/admin/organizations/${orgId}/topics`, {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    is_active: true
                })
            });
            onSuccess();
            onClose();
            setTitle("");
            setDescription("");
        } catch (err: any) {
            setError(err.message || "Failed to create topic.");
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

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Topic</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Add a new learning topic to your curriculum.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Topic Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Sales Onboarding"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            placeholder="Briefly describe this topic..."
                        />
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
                            {isLoading ? 'Creating...' : 'Create Topic'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
