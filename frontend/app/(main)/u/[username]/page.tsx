'use client';

import { useState } from 'react';
import PostCard from '@/templates/default/components/feed/PostCard';
import MediaViewer from '@/templates/default/components/feed/MediaViewer';
import { ProfileHeader } from '@/templates/default/components/profile/ProfileHeader';
import { ProfileSidebar } from '@/templates/default/components/profile/ProfileSidebar';

export default function ProfilePage({ params }: { params: { username: string } }) {
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

    const username = decodeURIComponent(params.username);

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Profile Header */}
            <ProfileHeader username={username} isOwnProfile={false} />

            <div className="flex gap-6 relative px-4 md:px-0">
                {/* Main Content Feed */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Filter Bar */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200 dark:border-gray-800">
                        <button className="px-4 py-1.5 rounded-[var(--radius-pill)] bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap">New</button>
                        <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">Hot</button>
                        <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">Top</button>
                    </div>

                    <div className="space-y-4">
                        <PostCard
                            id="mock-profile-1"
                            subreddit={`u/${username}`}
                            author={username}
                            time="1h ago"
                            title="Welcome to my profile! This is my first pinned post."
                            votes="15"
                            comments="2"
                            content="I am a new user on Noleij. Excited to be here!"
                        />

                        <PostCard
                            id="mock-profile-2"
                            subreddit="r/webdev"
                            author={username}
                            time="5 hours ago"
                            title="I just deployed my first Next.js app on Docker!"
                            content="It was a bit tricky with volume mounts on Windows, but I got it working."
                            votes="150"
                            comments="45"
                        />
                    </div>
                </div>

                {/* Right Sidebar - Profile Info */}
                <div className="hidden lg:block w-[312px] shrink-0">
                    <ProfileSidebar username={username} karma={1337} cakeDay="Dec 28, 2024" />
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
