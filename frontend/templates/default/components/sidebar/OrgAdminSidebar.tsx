'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    LayoutDashboard, Users, BookOpen, FileText, BarChart, Settings, ArrowLeft, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function OrgAdminSidebar({ preSelectedOrgId }: { preSelectedOrgId?: string }) {
    const pathname = usePathname();
    const params = useParams();
    // Use prop if available, otherwise fallback to URL params
    const orgId = preSelectedOrgId || params?.id;
    const { user } = useAuth();

    // Find current org name for display
    const currentOrg = user?.organizations?.find(o => o.id.toString() === orgId);

    const isActive = (path: string) => pathname?.includes(path);

    return (
        <div className="flex flex-col space-y-0.5">
            <div className="px-3 py-2 mb-2">

                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    {currentOrg?.name || 'Organization'}
                </h2>
                <div className="text-xs text-gray-500 dark:text-gray-400">Admin Console</div>
            </div>

            <hr className="border-reddit-border my-2 mx-3" />

            <Link href={`/admin/org/${orgId}`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive(`/admin/org/${orgId}`) && !isActive('/users') && !isActive('/topics') && !isActive('/files') && !isActive('/ai-reviews') && !isActive('/analytics') && !isActive('/settings') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <LayoutDashboard className="w-5 h-5" /> Overview
            </Link>

            <Link href={`/admin/org/${orgId}/users`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/users') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Users className="w-5 h-5" /> Employees
            </Link>

            <Link href={`/admin/org/${orgId}/files`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/files') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <FileText className="w-5 h-5" /> Knowledge Base
            </Link>

            <Link href={`/admin/org/${orgId}/ai-reviews`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/ai-reviews') ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Sparkles className="w-5 h-5" /> Reviews
            </Link>

            <Link href={`/admin/org/${orgId}/topics`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/topics') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <BookOpen className="w-5 h-5" /> Curriculum
            </Link>

            <Link href={`/admin/org/${orgId}/analytics`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/analytics') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <BarChart className="w-5 h-5" /> Analytics
            </Link>

            <hr className="border-reddit-border my-2 mx-3" />

            <Link href={`/admin/org/${orgId}/settings`} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/settings') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Settings className="w-5 h-5" /> Settings
            </Link>
        </div>
    );
}
