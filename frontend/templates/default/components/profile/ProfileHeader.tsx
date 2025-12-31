'use client';

import { Settings, Share, MoreHorizontal, MessageSquare, Plus } from 'lucide-react';

interface ProfileHeaderProps {
    username: string;
    isOwnProfile?: boolean;
}

export function ProfileHeader({ username, isOwnProfile = false }: ProfileHeaderProps) {
    return (
        <div className="bg-reddit-card w-full mb-4">
            {/* Banner - Placeholder Blue if no image */}
            <div className="h-32 md:h-48 bg-reddit-blue relative">
                {/* No functional banner upload yet */}
            </div>

            <div className="px-4 pb-4">
                <div className="flex flex-col relative">
                    {/* Avatar - Overlapping Banner */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-black bg-gray-500 -mt-10 md:-mt-12 flex items-center justify-center overflow-hidden relative z-10">
                        {/* Placeholder Avatar */}
                        <span className="text-3xl text-white font-bold">{username[0]?.toUpperCase() || 'U'}</span>
                        {/* Online Indicator */}
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mt-2 md:mt-0">
                        {/* Name & Title */}
                        <div className="mt-2 md:ml-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{username}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">u/{username}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 md:mt-2">
                            {isOwnProfile ? (
                                <button className="px-4 py-1.5 rounded-full border border-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Edit Profile
                                </button>
                            ) : (
                                <button className="px-6 py-1.5 rounded-full bg-reddit-blue text-white font-bold text-sm hover:bg-blue-600 transition-colors">
                                    Follow
                                </button>
                            )}
                            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
                                <Share size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 mt-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                    <button className="px-2 py-3 border-b-2 border-black dark:border-white font-bold text-sm whitespace-nowrap">Overview</button>
                    <button className="px-2 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-bold text-sm whitespace-nowrap">Posts</button>
                    <button className="px-2 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-bold text-sm whitespace-nowrap">Comments</button>
                    <button className="px-2 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-bold text-sm whitespace-nowrap">Saved</button>
                </div>
            </div>
        </div>
    );
}
