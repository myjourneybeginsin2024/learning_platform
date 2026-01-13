'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Building2, BarChart3, Home, Settings, ShieldCheck } from 'lucide-react';

export function SuperAdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex flex-col space-y-0.5">
            <div className="px-3 mb-2">
                <h3 className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Super Admin Area</h3>
            </div>

            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm mb-1">
                <Home className="w-5 h-5" /> Return to App
            </Link>

            <Link href="/superadmin" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/superadmin') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-reddit-text'}`}>
                <BarChart3 className="w-5 h-5 text-red-500" /> Dashboard
            </Link>

            <Link href="/superadmin/companies" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/superadmin/companies') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-reddit-text'}`}>
                <Building2 className="w-5 h-5 text-red-500" /> Companies
            </Link>

            <Link href="/superadmin/admins" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/superadmin/admins') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-reddit-text'}`}>
                <ShieldCheck className="w-5 h-5 text-red-500" /> Admins
            </Link>

            <Link href="/superadmin/users" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/superadmin/users') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-reddit-text'}`}>
                <Users className="w-5 h-5 text-red-500" /> Global Users
            </Link>

            <div className="mt-2 pt-2 border-t border-reddit-border">
                <Link href="/superadmin/settings" className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${isActive('/superadmin/settings') ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-reddit-text'}`}>
                    <Settings className="w-5 h-5" /> Settings
                </Link>
            </div>
        </div>
    );
}
