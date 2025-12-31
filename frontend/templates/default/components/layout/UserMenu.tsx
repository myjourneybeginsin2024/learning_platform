'use client';

import {
    User, Settings, LogOut, Moon,
    CreditCard, Shield, Gift, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 p-1 hover:bg-reddit-bg/50 rounded-md transition-colors"
                id="user-menu-button"
            >
                <div className="w-6 h-6 rounded-full bg-reddit-meta/20 overflow-hidden relative border border-gray-200">
                    <img src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:block text-left text-xs leading-none ml-1">
                    <div className="font-bold text-black">OpportunityThink1319</div>
                    <div className="text-reddit-meta">1 karma</div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-md shadow-lg border border-reddit-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                    {/* Section 1: My Stuff */}
                    <div className="py-2 border-b border-reddit-border">
                        <div className="px-4 py-2 flex items-center gap-2 text-reddit-meta text-xs font-bold uppercase tracking-wider mb-1">
                            <User size={14} /> My Stuff
                        </div>
                        <div className="flex flex-col">
                            <Link href="/u/OpportunityThink1319" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm font-medium text-reddit-text transition-colors">
                                <div className="w-5 flex justify-center"><User size={20} /></div> View Profile
                            </Link>
                            <button className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm font-medium text-reddit-text w-full text-left transition-colors">
                                <div className="w-5 flex justify-center"><User size={20} /></div> Edit Avatar
                            </button>
                        </div>
                    </div>

                    {/* Section 2: View Options */}
                    <div className="py-2 border-b border-reddit-border">
                        <div className="px-4 py-2 flex items-center gap-2 text-reddit-meta text-xs font-bold uppercase tracking-wider mb-1">
                            View Options
                        </div>
                        <div className="flex flex-col">
                            <button className="px-4 py-2 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-reddit-text w-full text-left transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 flex justify-center"><Moon size={20} /></div> Dark Mode
                                </div>
                                {/* Simple Toggle Switch Mockup */}
                                <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                                    <div className="absolute left-[2px] top-[2px] w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Section 3: More Stuff */}
                    <div className="py-2">
                        <div className="flex flex-col">
                            <button className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm font-medium text-reddit-text w-full text-left transition-colors">
                                <div className="w-5 flex justify-center"><CreditCard size={20} /></div> Premium
                            </button>
                            <button className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm font-medium text-reddit-text w-full text-left transition-colors">
                                <div className="w-5 flex justify-center"><Shield size={20} /></div> Moderation
                            </button>
                            <div className="h-px bg-reddit-border my-1 mx-4"></div>
                            <Link href="/login" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm font-medium text-reddit-text transition-colors">
                                <div className="w-5 flex justify-center"><LogOut size={20} /></div> Log Out
                            </Link>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
