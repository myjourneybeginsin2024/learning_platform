'use client';

import { X, ChevronLeft, ChevronRight, MessageSquare, Share2, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
}

export default function MediaViewer({ isOpen, onClose, imageUrl, title }: MediaViewerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Lock scroll when open
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

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-in fade-in duration-200 backdrop-blur-sm">
            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            >
                <X size={28} />
            </button>

            {/* Main Content (Image) */}
            {/* Main Content (Image) */}
            <div className="flex-1 w-full h-full relative" onClick={onClose}>
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>


        </div>,
        document.body
    );
}
