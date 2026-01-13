'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';

interface GenerationOverlayProps {
    isOpen: boolean;
    messages?: string[];
}

const DEFAULT_MESSAGES = [
    "Analyzing document structure...",
    "Extracting key concepts...",
    "Designing curriculum modules...",
    "Generating lesson content...",
    "Formatting output...",
    "Finalizing curriculum..."
];

export function GenerationOverlay({ isOpen, messages = DEFAULT_MESSAGES }: GenerationOverlayProps) {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setProgress(0);
            setMessageIndex(0);
            return;
        }

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        // Simulation Loop
        const interval = setInterval(() => {
            setProgress((prev) => {
                // If we reach 90%, we stay there until the parent closes us
                if (prev >= 90) return 90;
                // Random increment
                return prev + Math.random() * 2;
            });
        }, 800);

        // Message Rotation Loop
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000); // Change message every 3s

        return () => {
            clearInterval(interval);
            clearInterval(messageInterval);
            document.body.style.overflow = 'unset';
            // Double check cleanup in case component unmounts while open
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, messages]);

    if (!mounted || !isOpen) return null;

    // Use Portal to attach directly to body, bypassing parent stacking contexts
    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-white/90 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                {/* Spinning Ring */}
                <div className="absolute -inset-4 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            {/* Progress Percentage */}
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tabular-nums">
                {Math.round(progress)}%
            </div>

            {/* Status Message */}
            <div className="text-lg text-gray-600 dark:text-gray-300 font-medium h-8 overflow-hidden flex flex-col items-center">
                <span className="animate-pulse">
                    {messages[messageIndex]}
                </span>
            </div>

            <p className="mt-8 text-sm text-gray-400 max-w-xs text-center">
                Please wait, this may take a few minutes depending on the document size.
            </p>
        </div>,
        document.body
    );
}
