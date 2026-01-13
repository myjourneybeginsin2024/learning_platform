'use client';

import Link from 'next/link';
import { Home, Settings, ArrowLeft } from 'lucide-react';

export function AdminLandingSidebar() {
    return (
        <div className="flex flex-col space-y-0.5">
            <div className="px-3 py-2 mb-2">
                <Link href="/user" className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-3 h-3" /> Back to Home Feed
                </Link>
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    Admin Console
                </h2>
                <div className="text-xs text-gray-500 dark:text-gray-400">Select Organization</div>
            </div>

            <hr className="border-reddit-border my-2 mx-3" />

            <div className="px-3 py-2 text-sm text-gray-500">
                Please select an organization from the main area to manage its employees and content.
            </div>

            <hr className="border-reddit-border my-2 mx-3" />

            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="w-5 h-5" /> Account Settings
            </Link>
        </div>
    );
}
