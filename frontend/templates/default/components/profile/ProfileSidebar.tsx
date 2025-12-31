'use client';

import { Link } from 'lucide-react';

interface ProfileSidebarProps {
    username: string;
    karma: number;
    cakeDay: string;
}

export function ProfileSidebar({ username, karma, cakeDay }: ProfileSidebarProps) {
    return (
        <div className="bg-white dark:bg-reddit-card rounded-md border border-gray-200 dark:border-reddit-border p-4 shadow-sm">
            <div className="h-20 bg-reddit-blue rounded-t-md -mx-4 -mt-4 mb-4"></div>

            <div className="mb-4">
                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{username}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">u/{username}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{karma}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Karma</div>
                </div>
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{cakeDay}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cake Day</div>
                </div>
            </div>

            <button className="w-full py-2 bg-reddit-blue text-white font-bold rounded-full text-sm mb-2 hover:bg-blue-600 transition-colors">
                Follow
            </button>
            <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Chat
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button className="text-xs text-blue-600 font-bold">More Options</button>
            </div>
        </div>
    );
}
