'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SingleModulePage() {
    const params = useParams();
    const router = useRouter();
    const { topicId, moduleId } = params as { topicId: string; moduleId: string };

    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchModule() {
            try {
                const userRes = await apiFetch('/users/me');
                if (!userRes || !userRes.id) throw new Error("Authentication failed");

                const organizations = userRes.organizations;
                if (!organizations || organizations.length === 0) throw new Error("No Organizations found");

                let foundTopic = null;

                for (const org of organizations) {
                    try {
                        const t = await apiFetch(`/admin/organizations/${org.id}/topics/${topicId}`);
                        if (t) {
                            foundTopic = t;
                            break;
                        }
                    } catch (err) {
                        // Continue searching other orgs
                    }
                }

                if (foundTopic) {
                    const mod = foundTopic.modules.find((m: any) => m.id === Number(moduleId));
                    if (mod) {
                        setModule(mod);
                    } else {
                        setError("Segment not found. It may have been regenerated or deleted.");
                    }
                } else {
                    setError("Topic not found or access denied.");
                }
            } catch (e: any) {
                console.error("Failed to load module", e);
                setError(e.message || "Failed to load content.");
            } finally {
                setLoading(false);
            }
        }
        if (topicId && moduleId) fetchModule();
    }, [topicId, moduleId]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
    );

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <button
                    onClick={() => router.push(`/user?topicId=${topicId}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-6 mx-auto"
                >
                    <ArrowLeft size={20} /> Back to Topic
                </button>
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-8 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <h2 className="text-xl font-bold mb-2">Content Unavailable</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/user')}
                        className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!module) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <button
                onClick={() => router.push(`/user?topicId=${topicId}`)}
                className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft size={20} /> <span className="font-medium">Back to Topic</span>
            </button>

            <article className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                {module.image_url && (
                    <div className="h-64 sm:h-80 w-full overflow-hidden relative group">
                        <img
                            src={module.image_url}
                            alt={module.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        <h1 className="absolute bottom-6 left-6 right-6 text-3xl sm:text-4xl font-bold text-white shadow-sm drop-shadow-md">
                            {module.title}
                        </h1>
                    </div>
                )}

                <div className="px-8 py-10 sm:px-12 sm:py-12">
                    {!module.image_url && (
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                            {module.title}
                        </h1>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {module.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </article>
        </div>
    );
}
