import { X, Home, TrendingUp, Compass, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { useEffect } from 'react';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export function MobileDrawer({ isOpen, onClose, isDarkMode, toggleDarkMode }: MobileDrawerProps) {
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

                    {/* Main Links */}
                    <div className="space-y-1">
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                            <Home className="w-5 h-5" /> Home
                        </Link>
                        <Link href="/popular" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                            <TrendingUp className="w-5 h-5" /> Popular
                        </Link>
                        <Link href="/explore" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                            <Compass className="w-5 h-5" /> Explore
                        </Link>
                    </div>

                    {/* Communities */}
                    <div>
                        <h3 className="text-xs font-bold text-reddit-meta uppercase px-3 mb-2">Learning Communities</h3>
                        <div className="space-y-1">
                            <Link href="/r/webdev" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">W</div> Web Dev
                            </Link>
                            <Link href="/r/python" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px]">P</div> Python
                            </Link>
                            <Link href="/r/data" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">D</div> Data Science
                            </Link>
                        </div>
                    </div>

                    {/* Settings & Theme */}
                    <div className="pt-4 border-t border-reddit-border">
                        <h3 className="text-xs font-bold text-reddit-meta uppercase px-3 mb-2">Settings</h3>
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
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="pt-4 border-t border-reddit-border">
                        <h3 className="text-xs font-bold text-reddit-meta uppercase px-3 mb-2">Resources</h3>
                        <div className="px-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-black dark:text-white font-medium">
                            <Link href="#">About</Link>
                            <Link href="#">Help</Link>
                            <Link href="#">Blog</Link>
                            <Link href="#">Careers</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
