'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // Default to false (hidden) as requested
    // Default to true or false consistently for SSR (false matches the 'hidden' default of closed sidebar)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Correctly handle hydration by only checking localStorage on mount
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) {
            setIsSidebarOpen(JSON.parse(saved));
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarOpen', JSON.stringify(newState));
            return newState;
        });
    };
    const openSidebar = () => {
        setIsSidebarOpen(true);
        localStorage.setItem('sidebarOpen', JSON.stringify(true));
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
        localStorage.setItem('sidebarOpen', JSON.stringify(false));
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, openSidebar, closeSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
