"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Sparkles, CheckCircle, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import RoleGuard from '@/components/guards/RoleGuard';

export default function AIReviewsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params?.id as string;

    // Draft Interface matches what we saved in Files Page
    interface Draft {
        id: number;
        source_file: string;
        data: {
            main_topic: string;
            sub_topics: Array<{
                title: string;
                content: string;
            }>;
        };
        created_at: string;
    }

    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (orgId) {
            const stored = localStorage.getItem(`org_${orgId}_drafts`);
            if (stored) {
                setDrafts(JSON.parse(stored));
            }
        }
    }, [orgId]);

    const handleDiscard = (draftId: number) => {
        if (!confirm("Discard this draft?")) return;
        const updated = drafts.filter(d => d.id !== draftId);
        setDrafts(updated);
        localStorage.setItem(`org_${orgId}_drafts`, JSON.stringify(updated));
    };

    // State to track manual cover image inputs per draft
    const [coverUrls, setCoverUrls] = useState<{ [key: number]: string }>({});

    // State to track selected module indices per draft
    const [selectedIndices, setSelectedIndices] = useState<{ [draftId: number]: number[] }>({});

    // Initialize selections when drafts load or change
    useEffect(() => {
        const initialSelections: { [key: number]: number[] } = {};
        drafts.forEach(d => {
            // Default to all selected if not already set
            if (!selectedIndices[d.id]) {
                initialSelections[d.id] = d.data.sub_topics.map((_, i) => i);
            }
        });
        if (Object.keys(initialSelections).length > 0) {
            setSelectedIndices(prev => ({ ...prev, ...initialSelections }));
        }
    }, [drafts.length]); // Only run if draft count changes to avoid simple re-renders

    const toggleSelection = (draftId: number, index: number) => {
        setSelectedIndices(prev => {
            const current = prev[draftId] || [];
            if (current.includes(index)) {
                return { ...prev, [draftId]: current.filter(i => i !== index) };
            } else {
                return { ...prev, [draftId]: [...current, index].sort((a, b) => a - b) }; // Keep sorted
            }
        });
    };

    const toggleSelectAll = (draft: Draft) => {
        const allIndices = draft.data.sub_topics.map((_, i) => i);
        const current = selectedIndices[draft.id] || [];
        const isAllSelected = current.length === allIndices.length;

        setSelectedIndices(prev => ({
            ...prev,
            [draft.id]: isAllSelected ? [] : allIndices
        }));
    };

    const handleApprove = async (draft: Draft) => {
        const selected = selectedIndices[draft.id] || [];
        if (selected.length === 0) {
            alert("Please select at least one segment to include.");
            return;
        }

        setProcessingId(draft.id);
        const coverUrl = coverUrls[draft.id] || "";

        try {
            // Filter modules based on selection
            const modulesToCreate = draft.data.sub_topics
                .filter((_, idx) => selected.includes(idx))
                .map((sub, index) => ({
                    title: sub.title,
                    content: sub.content,
                    // Re-index sort order 0..N based on new filtered list
                    sort_order: index
                }));

            const payload = {
                title: draft.data.main_topic,
                description: `Generated from ${draft.source_file}`,
                image_url: coverUrl,
                is_active: true,
                modules: modulesToCreate
            };

            await apiFetch(`/admin/organizations/${orgId}/topics`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Success: Remove from drafts
            const updated = drafts.filter(d => d.id !== draft.id);
            setDrafts(updated);
            localStorage.setItem(`org_${orgId}_drafts`, JSON.stringify(updated));
            alert("Curriculum Approved and Created!");
            router.push(`/admin/org/${orgId}/topics`);

        } catch (e: any) {
            alert("Failed to create topic: " + e.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <RoleGuard allowedRoles={['org_admin']}>
            <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-600" /> AI Reviews
                        </h1>
                        <p className="text-gray-500 text-sm">Review content generated by Qwen before publishing.</p>
                    </div>
                </div>

                {drafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <Sparkles className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Pending Reviews</h3>
                        <p className="text-gray-500 max-w-md text-center mt-2">
                            Go to Knowledge Base, upload a document, and click "Generate" to see drafts here.
                        </p>
                        <button
                            onClick={() => router.push(`/admin/org/${orgId}/files`)}
                            className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            Go to Knowledge Base
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {drafts.map((draft) => (
                            <div key={draft.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#1A1A1B]">
                                {/* Header */}
                                <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 font-bold">
                                            AI
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{draft.data.main_topic}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> Source: {draft.source_file}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
                                            className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            {expandedId === draft.id ? 'Hide Details' : 'Review Details'}
                                            {expandedId === draft.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(draft)}
                                            disabled={processingId === draft.id}
                                            className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {processingId === draft.id ? 'Creating...' : <><CheckCircle className="w-4 h-4" /> Approve & Create</>}
                                        </button>
                                        <button
                                            onClick={() => handleDiscard(draft.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === draft.id && (
                                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                        {/* Cover Image Input */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Cover Image URL (For Dashboard Carousel)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                                value={coverUrls[draft.id] || ""}
                                                onChange={(e) => setCoverUrls(prev => ({ ...prev, [draft.id]: e.target.value }))}
                                            />
                                            {coverUrls[draft.id] && (
                                                <div className="mt-2 h-32 w-full max-w-sm rounded bg-gray-200 overflow-hidden">
                                                    <img src={coverUrls[draft.id]} className="w-full h-full object-cover" alt="Preview" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-gray-700 dark:text-gray-300">
                                                Generated Modules ({draft.data.sub_topics.length})
                                            </h4>
                                            <label className="flex items-center gap-2 text-sm font-medium text-purple-600 cursor-pointer hover:underline">
                                                <input
                                                    type="checkbox"
                                                    checked={(selectedIndices[draft.id]?.length || 0) === draft.data.sub_topics.length}
                                                    onChange={() => toggleSelectAll(draft)}
                                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                Select All
                                            </label>
                                        </div>

                                        <div className="grid gap-4">
                                            {draft.data.sub_topics.map((sub, idx) => {
                                                const isSelected = selectedIndices[draft.id]?.includes(idx);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-4 border rounded transition-colors flex gap-4 ${isSelected ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800' : 'border-gray-100 bg-gray-50 dark:bg-gray-900/10 dark:border-gray-700 opacity-60'}`}
                                                    >
                                                        <div className="pt-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!isSelected}
                                                                onChange={() => toggleSelection(draft.id, idx)}
                                                                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{(idx + 1)}. {sub.title}</h5>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{sub.content}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
