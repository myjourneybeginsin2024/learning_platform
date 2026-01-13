'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { X, Upload, Link as LinkIcon } from 'lucide-react';

interface AddFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orgId: string;
}

export function AddFileModal({ isOpen, onClose, onSuccess, orgId }: AddFileModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            // formData.append('name', fileName); // Backend uses filename, but we could support custom name later

            await apiFetch(`/admin/organizations/${orgId}/files`, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, browser sets it with boundary for FormData
            });
            onSuccess();
            onClose();
            setFileName("");
            setFile(null);
        } catch (err: any) {
            setError(err.message || "Failed to upload file.");
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

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Document</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Upload PDF or Text documents to train your organization's AI.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select File
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF or TXT (MAX. 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.txt,.md"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFile(e.target.files[0]);
                                            setFileName(e.target.files[0].name);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        {file && (
                            <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">Selected: {file.name}</p>
                        )}
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
                            {isLoading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
