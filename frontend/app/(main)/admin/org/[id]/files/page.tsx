'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileText, Trash2, Plus, Sparkles, Loader2 } from 'lucide-react';
import RoleGuard from '@/components/guards/RoleGuard';
import { AddFileModal } from '@/components/organizations/AddFileModal';
import { GenerationOverlay } from '@/components/ui/GenerationOverlay';

export default function OrgFilesPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params?.id as string;
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Generating state per file
    const [generatingId, setGeneratingId] = useState<number | null>(null);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/admin/organizations/${orgId}/files`);
            setFiles(data);
        } catch (e) {
            console.error("Fetch files error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) fetchFiles();
    }, [orgId]);

    const handleDelete = async (fileId: number) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        try {
            await apiFetch(`/admin/organizations/${orgId}/files/${fileId}`, {
                method: 'DELETE'
            });
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (e) {
            alert("Failed to delete file");
        }
    };

    const handleGenerate = async (fileId: number, fileName: string) => {
        if (generatingId) return;
        setGeneratingId(fileId);
        try {
            const data = await apiFetch(`/admin/organizations/${orgId}/files/${fileId}/generate`, {
                method: 'POST'
            });

            // Store draft in localStorage for the Review page
            const existingDrafts = JSON.parse(localStorage.getItem(`org_${orgId}_drafts`) || '[]');
            const newDraft = {
                id: Date.now(), // Temp ID
                source_file: fileName,
                data: data, // The AI JSON structure
                created_at: new Date().toISOString()
            };
            localStorage.setItem(`org_${orgId}_drafts`, JSON.stringify([newDraft, ...existingDrafts]));

            router.push(`/admin/org/${orgId}/ai-reviews`);
        } catch (e: any) {
            alert("AI Generation failed: " + (e.message || "Unknown error"));
        } finally {
            setGeneratingId(null);
        }
    };

    return (
        <RoleGuard allowedRoles={['org_admin']}>
            {/* The Overlay component blocks interaction when valid */}
            <GenerationOverlay isOpen={!!generatingId} />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage documents for your organization's AI.</p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Document
                    </button>
                </div>

                {/* File List */}
                <div className="bg-white dark:bg-[#1A1A1B] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Uploaded At</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading documents...</td></tr>
                            ) : files.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No documents found.</td></tr>
                            ) : (
                                files.map((file: any) => (
                                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {file.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 uppercase text-xs">{file.file_type}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(file.uploaded_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleGenerate(file.id, file.name)}
                                                    disabled={generatingId === file.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-md text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition disabled:opacity-50"
                                                    title="Generate Curriculum with AI"
                                                >
                                                    {/* We keep the spinner here just in case, or remove it since we overlap */}
                                                    <Sparkles className="w-3 h-3" />
                                                    Generate
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Delete File"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddFileModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchFiles}
                orgId={orgId}
            />
        </RoleGuard>
    );
}
