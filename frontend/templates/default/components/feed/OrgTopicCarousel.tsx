'use client';

import { Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface Topic {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    modules: { id: number; title: string; content: string; image_url?: string }[];
}

interface OrgTopicCarouselProps {
    orgId: number;
    basePath?: string;
    onTopicSelect?: (topic: Topic) => void;
}

export default function OrgTopicCarousel({ orgId, basePath, onTopicSelect }: OrgTopicCarouselProps) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadTopics() {
            try {
                const data = await apiFetch(`/admin/organizations/${orgId}/topics`);
                setTopics(data);
            } catch (e) {
                console.error("Failed to load org topics", e);
            } finally {
                setLoading(false);
            }
        }
        if (orgId) loadTopics();
    }, [orgId]);

    const handleTopicClick = (topic: Topic) => {
        if (onTopicSelect) {
            onTopicSelect(topic);
        } else {
            router.push(basePath ? `${basePath}/${topic.id}` : `/org/${orgId}/topic/${topic.id}`);
        }
    };

    if (loading) return <div className="h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6"></div>;

    if (topics.length === 0) return (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl text-white flex items-center justify-between">
            <div>
                <h3 className="font-bold text-lg">No Learning Topics Yet</h3>
                <p className="text-purple-200 text-sm">Your organization hasn't published any curriculum content.</p>
            </div>
            {/* If admin, maybe show link? For now just visual */}
        </div>
    );

    return (
        <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 px-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BookOpen size={16} className="text-purple-500" />
                Featured Learning
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide-default snap-x">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        onClick={() => handleTopicClick(topic)}
                        className="relative min-w-[280px] h-[200px] rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-transform hover:scale-[1.02] snap-center bg-gray-800 group"
                    >
                        {topic.image_url ? (
                            <img
                                src={topic.image_url}
                                alt={topic.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
                                <Sparkles className="w-12 h-12 text-white/50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                            <span className="inline-block px-2 py-0.5 rounded bg-purple-500/80 text-white text-[10px] font-bold mb-2 backdrop-blur-sm">
                                {topic.modules.length} Segments
                            </span>
                            <h3 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2 shadow-sm">{topic.title}</h3>
                            <p className="text-xs text-gray-300 font-medium line-clamp-1 opacity-90">{topic.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
