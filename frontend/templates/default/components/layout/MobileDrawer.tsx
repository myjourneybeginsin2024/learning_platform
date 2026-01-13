import {
    X, Home, BarChart3, Building2, Users, Settings, Moon, Sun, ChevronDown, ChevronUp,
    TrendingUp, Compass, Globe, Info, HelpCircle, FileText, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export function MobileDrawer({ isOpen, onClose, isDarkMode, toggleDarkMode }: MobileDrawerProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'super admin';
    const isSuperAdminPage = pathname?.startsWith('/superadmin');

    const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(true);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div
                className={clsx(
                    "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-reddit-card z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-reddit-border shrink-0">
                    <div className="relative h-8 w-24">
                        <Image
                            src="/assets/logo-white-bg.jpg"
                            alt="Noleij Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="/assets/logo-white.jpg"
                            alt="Noleij Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                        <X className="w-6 h-6 text-reddit-text" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* CONDITION 1: SUPER ADMIN DASHBOARD MOBILE MENU */}
                    {isSuperAdminPage && isSuperAdmin ? (
                        <div className="space-y-1">
                            <div className="px-3 mb-2">
                                <h3 className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Super Admin Area</h3>
                            </div>

                            <Link href="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Home className="w-5 h-5" /> Return to App
                            </Link>

                            <Link href="/superadmin" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <BarChart3 className="w-5 h-5 text-red-500" /> Dashboard
                            </Link>

                            <Link href="/superadmin/companies" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Building2 className="w-5 h-5 text-red-500" /> Companies
                            </Link>

                            <Link href="/superadmin/admins" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <span className="font-bold text-red-500 text-xs">A</span>
                                </div> Admins
                            </Link>

                            <Link href="/superadmin/users" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Users className="w-5 h-5 text-red-500" /> Global Users
                            </Link>
                        </div>
                    ) : pathname?.startsWith('/admin/org/') ? (
                        /* CONDITION 2: ORGANIZATION ADMIN MENU */
                        <div className="space-y-1">
                            <div className="px-3 mb-2">
                                <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Organization Admin</h3>
                            </div>

                            {(() => {
                                // Extract Org ID from path
                                const orgId = pathname.split('/')[3];
                                return (
                                    <>
                                        <Link href={`/admin/org/${orgId}`} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <BarChart3 className="w-5 h-5 text-blue-500" /> Dashboard
                                        </Link>
                                        <Link href={`/admin/org/${orgId}/users`} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <Users className="w-5 h-5 text-blue-500" /> Employees
                                        </Link>
                                        <Link href={`/admin/org/${orgId}/files`} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <FileText className="w-5 h-5 text-blue-500" /> Knowledge Base
                                        </Link>
                                        <Link href={`/admin/org/${orgId}/topics`} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <Briefcase className="w-5 h-5 text-blue-500" /> Curriculum
                                        </Link>
                                        <Link href={`/admin/org/${orgId}/analytics`} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <TrendingUp className="w-5 h-5 text-blue-500" /> Analytics
                                        </Link>

                                        <div className="my-2 border-t border-reddit-border"></div>

                                        <Link href="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                            <Home className="w-4 h-4" /> Back to App
                                        </Link>
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        /* CONDITION 3: DEFAULT APP MOBILE MENU */
                        <div className="space-y-1">
                            <Link href="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Home className="w-5 h-5" /> Home
                            </Link>
                            <Link href="/popular" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <TrendingUp className="w-5 h-5" /> Popular
                            </Link>
                            <Link href="/explore" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Compass className="w-5 h-5" /> Explore
                            </Link>
                            <Link href="/all" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Globe className="w-5 h-5" /> All
                            </Link>

                            {/* Admin Link for Mobile */}
                            {isSuperAdmin && (
                                <Link href="/superadmin" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 dark:bg-red-900/10 font-medium text-red-600 dark:text-red-400 mt-2">
                                    <BarChart3 className="w-5 h-5" /> Super Admin
                                </Link>
                            )}

                            {/* Learning Communities */}
                            <div className="pt-4 border-t border-reddit-border mt-2">
                                <button
                                    onClick={() => setIsCommunitiesOpen(!isCommunitiesOpen)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-reddit-meta uppercase hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md group"
                                >
                                    <span>Communities</span>
                                    {isCommunitiesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {isCommunitiesOpen && (
                                    <div className="space-y-1 mt-1">
                                        <Link href="/r/webdev" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">W</div> Web Dev
                                        </Link>
                                        <Link href="/r/python" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px]">P</div> Python
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings & Theme (Common) */}
                    <div className="pt-4 border-t border-reddit-border">
                        <div className="space-y-1">
                            <button
                                onClick={toggleDarkMode}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text"
                            >
                                <div className="flex items-center gap-3">
                                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    <span>Dark Mode</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-reddit-blue' : 'bg-gray-300'} relative`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`}></div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <Settings className="w-5 h-5" /> Settings
                            </button>
                        </div>
                    </div>

                </div>
            </div >
        </>
    );
}
