'use client';

import { Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export function SidebarToggle() {
    const { toggleSidebar, isSidebarOpen } = useSidebar();

    // Calculate position: Sidebar is 270px. Button is 40px.
    // Open: Center on the 270px line -> left = 270 - 20 = 250px.
    // Closed: Flush left or slightly indented -> left = 0.

    return (
        <div className="hidden lg:block sticky top-14 z-50 w-0 h-0">
            <div
                className={`absolute top-4 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-[250px]' : 'translate-x-4'}`}
            >
                <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center rounded-full bg-white dark:bg-reddit-card border border-reddit-border text-black dark:text-white shrink-0 h-10 w-10 transition-transform hover:bg-gray-50 dark:hover:bg-gray-800 shadow-md"
                    aria-label={isSidebarOpen ? "Collapse Navigation" : "Expand Navigation"}
                    suppressHydrationWarning
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black text-white text-xs font-bold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {isSidebarOpen ? "Collapse Navigation" : "Expand Navigation"}
                </div>
            </div>
        </div>
    );
}
