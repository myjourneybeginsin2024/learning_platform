'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, Plus, Bell, MessageSquare, ChevronDown, User, Shirt, FileText, Trophy, DollarSign, Shield, Moon, LogOut, Megaphone, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MobileDrawer } from './MobileDrawer';
import { UserDrawer } from './UserDrawer';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth(); // Integrated AuthContext

    // UI States
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const openAuth = (view: 'login' | 'register') => {
        setAuthView(view);
        setIsAuthModalOpen(true);
    };

    // Dark Mode Toggle Logic
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        logout(); // Real logout
    };

    return (
        <>
            <nav className="fixed top-0 inset-x-0 h-14 bg-reddit-card border-b border-reddit-border z-50 flex items-center px-4 justify-between">
                {/* Left: Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="md:hidden p-1 hover:bg-gray-100 rounded-md"
                    >
                        <Menu className="w-6 h-6 text-reddit-text" />
                    </button>
                    <Link href="/" className="flex items-center gap-2 relative h-10 w-32">
                        <Image
                            src="/assets/logo-dark.jpg"
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
                    </Link>
                </div>

                {/* Middle: Search */}
                <div className="flex-1 max-w-2xl px-4 hidden md:block">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-reddit-meta" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find anything"
                            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border border-transparent focus:border-reddit-primary focus:bg-white dark:focus:bg-black rounded-full py-1.5 pl-10 pr-4 outline-none transition-all text-reddit-text"
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {isAuthenticated ? (
                        <>
                            {/* Desktop Actions (Logged In) */}
                            <div className="hidden md:flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-reddit-text transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 text-reddit-text font-bold text-sm transition-colors">
                                    <Plus className="w-5 h-5" />
                                    <span>Create</span>
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-reddit-text transition-colors">
                                    <Bell className="w-5 h-5" />
                                </button>

                                {/* User Profile Menu */}
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pr-2 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden flex items-center justify-center text-white font-bold">
                                            {/* Avatar Fallback */}
                                            {user?.email?.[0].toUpperCase() || 'U'}
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-reddit-meta" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-reddit-card rounded-lg shadow-xl border border-reddit-border overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                            {/* User Info Header */}
                                            <Link
                                                href={`/u/${(user?.email || 'user').split('@')[0]}`}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-reddit-border"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden flex items-center justify-center text-white font-bold">
                                                    {user?.email?.[0].toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-reddit-text truncate">View Profile</div>
                                                    <div className="text-xs text-reddit-meta truncate">u/{(user?.email || 'user').split('@')[0]}</div>
                                                </div>
                                            </Link>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    href="/settings"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-reddit-text"
                                                >
                                                    <User className="w-5 h-5 text-reddit-meta" />
                                                    <span>Settings</span>
                                                </Link>
                                                {/* ... (Keep other items) ... */}
                                            </div>

                                            {/* Dark Mode Toggle */}
                                            <div className="border-t border-reddit-border py-2">
                                                <button
                                                    onClick={toggleDarkMode}
                                                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-reddit-text"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Moon className="w-5 h-5 text-reddit-meta" />
                                                        <span>Dark Mode</span>
                                                    </div>
                                                    <div className={`w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-reddit-blue' : 'bg-gray-300'} relative`}>
                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`}></div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-reddit-text"
                                                >
                                                    <LogOut className="w-5 h-5 text-reddit-meta" />
                                                    <span>Log Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile - Logged In goes here (omitted for brevity in replacement, but kept structure in mind) */}
                            {/* Re-use same Logout logic for Mobile if needed, but for now focusing on Desktop logic */}
                            <button
                                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white font-bold"
                                onClick={() => setIsUserDrawerOpen(true)}
                            >
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Desktop Actions (Logged Out) */}
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => openAuth('login')}
                                    className="flex items-center gap-2 px-6 py-1.5 rounded-full bg-reddit-blue hover:bg-reddit-blue-hover transition-colors text-white font-bold text-sm whitespace-nowrap"
                                >
                                    Log In
                                </button>
                            </div>
                            {/* Mobile Logged Out */}
                            <button
                                onClick={() => openAuth('login')}
                                className="md:hidden px-4 py-1.5 bg-reddit-blue text-white rounded-full font-bold text-xs"
                            >
                                Log In
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
            <UserDrawer isOpen={isUserDrawerOpen} onClose={() => setIsUserDrawerOpen(false)} />

            {isAuthModalOpen && (
                <AuthModal
                    initialView={authView}
                    onClose={() => setIsAuthModalOpen(false)}
                />
            )}
        </>
    );
}
