'use client';

import Link from 'next/link';
import {
    TrendingUp, Compass, Globe, ChevronDown, ChevronUp, Home,
    HelpCircle, Info, FileText, Briefcase, Settings, BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function DefaultSidebar() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'super admin';

    // Accordion states
    const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(true);
    const [isResourcesOpen, setIsResourcesOpen] = useState(true);

    return (
        <div className="flex flex-col space-y-0.5" data-sidebar-version="v2-separated">
            {/* Version v2-separated */}
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                <Home className="w-5 h-5" /> Home
            </Link>
            <Link href="/popular" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                <TrendingUp className="w-5 h-5" /> Popular
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                <Compass className="w-5 h-5" /> Explore
            </Link>
            <Link href="/all" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                <Globe className="w-5 h-5" /> All
            </Link>

            {/* Super Admin Dashboard Link (Visible to Super Admins only) */}
            {isSuperAdmin && (
                <Link href="/superadmin" className="mt-2 flex items-center gap-3 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 font-medium text-red-600 dark:text-red-400 text-sm">
                    <BarChart3 className="w-5 h-5" /> Super Admin
                </Link>
            )}

            {/* Organization Admin Dashboard Link */}
            {(user?.role === 'admin' || user?.organizations?.some(o => o.role === 'admin')) && (
                <Link href="/admin" className="mt-2 flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 font-medium text-blue-600 dark:text-blue-400 text-sm">
                    <Briefcase className="w-5 h-5" /> Organization Admin
                </Link>
            )}

            <hr className="border-reddit-border my-2 mx-3" />

            {/* Learning Communities Accordion */}
            <div>
                <button
                    onClick={() => setIsCommunitiesOpen(!isCommunitiesOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-reddit-meta uppercase hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md group"
                >
                    <span>Learning Communities</span>
                    {isCommunitiesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isCommunitiesOpen && (
                    <div className="space-y-0.5 mt-1">
                        <Link href="/r/webdev" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">W</div> Web Dev
                        </Link>
                        <Link href="/r/python" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px]">P</div> Python
                        </Link>
                        <Link href="/r/data" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">D</div> Data Science
                        </Link>
                    </div>
                )}
            </div>

            <hr className="border-reddit-border my-2 mx-3" />

            {/* Resources Accordion */}
            <div>
                <button
                    onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-reddit-meta uppercase hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md group"
                >
                    <span>Resources</span>
                    {isResourcesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isResourcesOpen && (
                    <div className="space-y-0.5 mt-1">
                        <Link href="/about" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <Info className="w-5 h-5" /> About Noleij
                        </Link>
                        <Link href="/help" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <HelpCircle className="w-5 h-5" /> Help Center
                        </Link>
                        <Link href="/terms" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <FileText className="w-5 h-5" /> Terms & Privacy
                        </Link>
                        <Link href="/careers" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                            <Briefcase className="w-5 h-5" /> Careers
                        </Link>
                    </div>
                )}
            </div>

            <hr className="border-reddit-border my-2 mx-3" />

            <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                <Settings className="w-5 h-5" /> Settings
            </button>
        </div>
    );
}
