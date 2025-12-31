'use client';

import React, { useRef } from 'react';

export default function HomeInfoCard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="bg-reddit-card border border-reddit-border rounded-md mb-4">
            {/* Banner */}
            <div className="h-8 bg-reddit-bg rounded-t-md"></div>
            <div className="px-3 pb-3">
                <div className="flex items-center gap-2 mb-2 pt-2">
                    <span className="font-bold text-base text-reddit-text">Home</span>
                </div>
                <p className="text-sm text-reddit-text mb-4">
                    Your personal Noleij frontpage. Come here to check in with your favorite communities.
                </p>
                <div className="flex flex-col gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 bg-reddit-blue text-white rounded-full font-bold hover:bg-reddit-blue-hover transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Upload Doc</span>
                    </button>
                    <button className="w-full py-1.5 border border-reddit-blue text-reddit-blue rounded-full font-bold hover:bg-blue-50 transition-colors">
                        Input Topic
                    </button>
                </div>
            </div>
        </div>
    );
}
