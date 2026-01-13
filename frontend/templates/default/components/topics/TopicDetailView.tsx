'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Module {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    sort_order: number;
}

interface Topic {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    created_at: string;
    modules: Module[];
}

interface TopicDetailViewProps {
    orgId: string | number | null | undefined;
    topicId: string | number | null | undefined;
    backPath?: string; // Optional custom back path
}

export default function TopicDetailView({ orgId, topicId, backPath }: TopicDetailViewProps) {
    const router = useRouter();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orgId || !topicId) {
            console.log("DEBUG: Params missing in View", { orgId, topicId });
            setLoading(false);
            return;
        }

        async function fetchTopic() {
            try {
                const data = await apiFetch(`/admin/organizations/${orgId}/topics`);
                const found = data.find((t: any) => t.id === Number(topicId));
                setTopic(found || null);
            } catch (e) {
                console.error("DEBUG: Fetch topic error", e);
            } finally {
                setLoading(false);
            }
        }
        fetchTopic();
    }, [orgId, topicId]);

    const handleBack = () => {
        if (backPath) {
            router.push(backPath);
        } else {
            router.back();
        }
    };

    if (loading) return <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading topic content...</p>
    </div>;

    if (!topic) return (
        <div className="p-8 text-center text-gray-500">
            <h2 className="text-xl font-bold mb-2">Topic Not Found</h2>
            <p>Could not find topic #{topicId}.</p>
            <button onClick={handleBack} className="mt-4 text-purple-600 hover:underline">Go Back</button>
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto pb-20">
            {/* Navigation */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition"
            >
                <ArrowLeft size={20} /> Back to Feed
            </button>

            {/* Hero Section */}
            <div className="relative h-[300px] rounded-2xl overflow-hidden mb-8 group">
                {topic.image_url ? (
                    <img
                        src={topic.image_url}
                        alt={topic.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-800 to-indigo-900 flex items-center justify-center">
                        <BookOpen size={64} className="text-white/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 text-purple-300 text-sm font-medium mb-3">
                        <span className="bg-purple-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30">
                            {topic.modules.length} Segments
                        </span>
                        <span>Created {new Date(topic.created_at).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 shadow-sm">{topic.title}</h1>
                    <p className="text-gray-200 max-w-2xl text-lg">{topic.description}</p>
                </div>
            </div>

            {/* Content Segments */}
            <div className="space-y-8">
                {topic.modules.map((module, idx) => (
                    <div key={module.id} className="bg-white dark:bg-[#1A1A1B] rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                            </div>
                            <div className="space-y-4 flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{module.title}</h2>
                                {module.image_url && (
                                    <div className="w-full h-[200px] rounded-lg overflow-hidden my-4">
                                        <img src={module.image_url} alt={module.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {module.content}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
