'use client';

import { X, User, Settings, FileText, Award, DollarSign, Shield, Moon, LogOut } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export function UserDrawer({ isOpen, onClose, isDarkMode, toggleDarkMode }: UserDrawerProps) {
    const { user, logout } = useAuth();

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

    const handleLogout = () => {
        onClose();
        logout();
    };

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

            {/* Bottom Sheet Content */}
            <div
                className={clsx(
                    "fixed bottom-0 left-0 right-0 bg-white dark:bg-reddit-card z-50 transform transition-transform duration-300 ease-in-out md:hidden rounded-t-[20px] max-h-[90vh] overflow-y-auto flex flex-col",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* User Info Header */}
                <div className="px-4 py-2">
                    <Link href={`/u/${(user?.email || 'user').split('@')[0]}`} onClick={onClose} className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-500 rounded-full relative flex items-center justify-center text-white font-bold">
                            {user?.email?.[0].toUpperCase() || 'U'}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-reddit-card rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-black dark:text-white">View Profile</span>
                            <span className="text-xs text-reddit-meta">u/{(user?.email || 'user').split('@')[0]}</span>
                        </div>
                    </Link>
                </div>

                {/* Menu Items */}
                <div className="flex-1 px-4 space-y-4 pb-8">
                    {/* Section 1 */}
                    <div className="space-y-4">
                        <button className="flex items-center gap-3 w-full text-left">
                            <i className="w-6"><img src="https://www.redditstatic.com/desktop2x/img/id-cards/snoo-home@2x.png" className="w-5 h-5 opacity-0" alt="" /> {/* Placeholder alignment */}</i>
                            <span className="font-medium text-black dark:text-gray-200">Edit Avatar</span>
                        </button>
                        <button className="flex items-center gap-3 w-full text-left">
                            <FileText size={20} className="text-gray-700 dark:text-gray-400" />
                            <span className="font-medium text-black dark:text-gray-200">Drafts</span>
                        </button>
                        <button className="flex items-center gap-3 w-full text-left">
                            <Award size={20} className="text-gray-700 dark:text-gray-400" />
                            <div className="flex flex-col">
                                <span className="font-medium text-black dark:text-gray-200">Achievements</span>
                                <span className="text-xs text-reddit-meta">2 unlocked</span>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 w-full text-left">
                            <DollarSign size={20} className="text-gray-700 dark:text-gray-400" />
                            <div className="flex flex-col">
                                <span className="font-medium text-black dark:text-gray-200">Earn</span>
                                <span className="text-xs text-reddit-meta">Earn cash on Noleij</span>
                            </div>
                        </button>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 2 */}
                    <div className="space-y-4">
                        <button className="flex items-center gap-3 w-full text-left">
                            <Shield size={20} className="text-gray-700 dark:text-gray-400" />
                            <span className="font-medium text-black dark:text-gray-200">Premium</span>
                        </button>
                        <button className="flex items-center gap-3 w-full text-left justify-between" onClick={toggleDarkMode}>
                            <div className="flex items-center gap-3">
                                <Moon size={20} className="text-gray-700 dark:text-gray-400" />
                                <span className="font-medium text-black dark:text-gray-200">Dark Mode</span>
                            </div>
                            {/* Toggle Switch */}
                            <div className={clsx("w-10 h-6 rounded-full transition-colors relative", isDarkMode ? "bg-reddit-blue" : "bg-gray-200 dark:bg-gray-700")}>
                                <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", isDarkMode ? "left-[22px]" : "left-1")}></div>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 w-full text-left" onClick={handleLogout}>
                            <LogOut size={20} className="text-gray-700 dark:text-gray-400" />
                            <span className="font-medium text-black dark:text-gray-200">Log Out</span>
                        </button>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 3 */}
                    <div className="space-y-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                        <button className="flex items-center gap-3 w-full text-left">
                            <Settings size={20} /> Settings
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
