'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PostCard from '@/templates/default/components/feed/PostCard';
import { RightSidebar } from '@/templates/default/components/layout/RightSidebar';
import { useState } from 'react';
import MediaViewer from '@/templates/default/components/feed/MediaViewer';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { subreddit, postId } = params;

    // Mock Data Retrieval based on ID (In a real app, fetch from API)
    // For now, we'll just mock it to look like the feed posts
    const getMockPost = (id: string) => {
        if (id === '1') {
            return {
                id: '1',
                subreddit: 'r/ArcRaiders',
                author: 'Foxeeh_',
                time: '2d ago',
                title: 'Embark can people that willingly reset hundred of hours of progress get the ACTUAL tutorial outfit instead of a changed up, goofy version of it?',
                votes: '700',
                comments: '470',
                image: '/assets/content-main.jpg'
            };
        } else if (id === '2') {
            return {
                id: '2',
                subreddit: 'r/webdev',
                author: 'frontend_wizard',
                time: '5 hours ago',
                title: 'I recreated Reddit using Next.js and Tailwind CSS!',
                content: 'It was a fun challenge. I used the new Tailwind v4 alpha and the developer experience is insane.',
                votes: '12k',
                comments: '45'
            };
        } else {
            return {
                id: id as string,
                subreddit: `r/${subreddit}`,
                author: 'user123',
                time: '1h ago',
                title: 'Mock Post Title for ID ' + id,
                content: 'This is a mock post content for the detail view.',
                votes: '100',
                comments: '20'
            };
        }
    };

    const post = getMockPost(postId as string);

    const [mediaViewerData, setMediaViewerData] = useState<{ isOpen: boolean, url: string, title: string }>({
        isOpen: false,
        url: '',
        title: ''
    });

    const openMedia = (url: string, title: string) => {
        setMediaViewerData({ isOpen: true, url, title });
    };

    const closeMedia = () => {
        setMediaViewerData(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="max-w-[1200px] mx-auto">
            <div className="flex gap-6 relative">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-reddit-meta hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 -ml-2 rounded-full mb-4 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={20} />
                        Back to Feed
                    </button>

                    <div className="space-y-4">
                        {/* The Post Itself */}
                        <PostCard
                            {...post}
                            onImageClick={post.image ? () => openMedia(post.image!, post.title) : undefined}
                        />

                        {/* Comments Section Placeholder */}
                        <div className="bg-reddit-card border border-reddit-border rounded-[var(--radius-xl)] p-4 min-h-[300px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-reddit-text">Comments</h3>
                                <div className="text-reddit-meta text-sm">Sorted by: <span className="font-bold text-reddit-blue cursor-pointer">Best</span></div>
                            </div>

                            {/* Comment Input Placeholder */}
                            <div className="mb-8 border border-reddit-border rounded-md bg-gray-50 dark:bg-gray-900 p-2 opacity-60">
                                <div className="h-24 flex items-center justify-center text-reddit-meta text-sm">
                                    Log in to comment
                                </div>
                            </div>

                            {/* Mock Comments */}
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 rounded-full bg-reddit-meta/20"></div>
                                            <div className="w-0.5 h-full bg-reddit-border/50 my-2"></div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-reddit-meta">
                                                <span className="font-bold text-reddit-text">commenter_{i}</span>
                                                <span>•</span>
                                                <span>{i}h ago</span>
                                            </div>
                                            <p className="text-sm text-reddit-text">
                                                This is a mock comment #{i}. The detail page seems to be working correctly!
                                            </p>
                                            <div className="flex items-center gap-4 text-reddit-meta text-xs font-bold pt-1">
                                                <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                                    <span>Upvote</span>
                                                </button>
                                                <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                                    <span>Reply</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:block w-[312px] shrink-0">
                    <RightSidebar showHomeCard={true} />
                </div>
            </div>

            <MediaViewer
                isOpen={mediaViewerData.isOpen}
                onClose={closeMedia}
                imageUrl={mediaViewerData.url}
                title={mediaViewerData.title}
            />
        </div>
    );
}
