"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { BookOpen, Plus, Trash2, Eye } from 'lucide-react';
import RoleGuard from '@/components/guards/RoleGuard';
import { AddTopicModal } from '@/components/organizations/AddTopicModal';

export default function OrgTopicsPage() {
    const params = useParams();
    const orgId = params?.id as string;
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/admin/organizations/${orgId}/topics`);
            setTopics(data);
        } catch (e) {
            console.error("Fetch topics error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) fetchTopics();
    }, [orgId]);

    const handleDelete = async (topicId: number) => {
        if (!confirm("Are you sure you want to delete this topic?")) return;
        try {
            await apiFetch(`/admin/organizations/${orgId}/topics/${topicId}`, {
                method: 'DELETE'
            });
            setTopics(prev => prev.filter(t => t.id !== topicId));
        } catch (e) {
            alert("Failed to delete topic");
        }
    };

    return (
        <RoleGuard allowedRoles={['org_admin']}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curriculum Topics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Define the core topics your employees should learn.</p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Create Topic
                    </button>
                </div>

                {/* List */}
                {loading ? <p>Loading topics...</p> : (
                    <div className="grid gap-4">
                        {topics.length === 0 ? (
                            <div className="bg-white dark:bg-[#1A1A1B] p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-gray-500">No topics defined yet. Start by creating one.</p>
                            </div>
                        ) : (
                            topics.map((topic: any) => (
                                <div key={topic.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition flex justify-between items-center bg-white dark:bg-[#1A1A1B]">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{topic.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{topic.description || "No description provided."}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${topic.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                            {topic.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
                                            <a
                                                href={`/admin/org/${orgId}/topics/${topic.id}`}
                                                className="text-gray-400 hover:text-purple-600 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                                                title="View Curriculum Content"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(topic.id)}
                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                title="Delete Topic"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <AddTopicModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTopics}
                orgId={orgId}
            />
        </RoleGuard>
    );
}
