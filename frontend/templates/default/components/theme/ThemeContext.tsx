'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'reddit' | 'retro' | 'cyberpunk';
export type Mode = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    mode: Mode;
    setTheme: (theme: Theme) => void;
    setMode: (mode: Mode) => void;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('reddit');
    const [mode, setMode] = useState<Mode>('light');

    useEffect(() => {
        // Load from local storage on mount
        const savedTheme = localStorage.getItem('app-theme') as Theme;
        const savedMode = localStorage.getItem('app-mode') as Mode;

        if (savedTheme) setTheme(savedTheme);
        if (savedMode) setMode(savedMode);
    }, []);

    useEffect(() => {
        // Save to local storage
        localStorage.setItem('app-theme', theme);
        localStorage.setItem('app-mode', mode);

        // Apply classes to body
        // Remove all previous theme classes
        document.body.classList.remove('theme-reddit', 'theme-retro', 'theme-cyberpunk', 'light', 'dark');

        // Add current 
        document.body.classList.add(`theme-${theme}`, mode);

        // Also manage data-theme attribute for easier CSS selection if needed
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-mode', mode);

        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

    }, [theme, mode]);

    const toggleMode = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
