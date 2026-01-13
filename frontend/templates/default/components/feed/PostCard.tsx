'use client';

import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

export interface PostCardProps {
    id: string; // Used for key or fallback
    subreddit: string;
    author: string;
    time: string;
    title: string;
    content?: string;
    image?: string;
    visualContent?: React.ReactNode;
    votes: string;
    comments: string;
    isSpoiler?: boolean;
    isPromoted?: boolean;
    onImageClick?: () => void;

    // New Props for Customization
    navPath?: string; // Overrides the default Reddit-style ID link
    hidePrefixes?: boolean; // If true, hides "r/" and "u/"
    customMetadata?: React.ReactNode; // Injects extra info (e.g. "Segment 1")
    customFooter?: React.ReactNode; // Replaces standard Vote/Comment buttons
}

export default function PostCard({
    id,
    subreddit,
    author,
    time,
    title,
    content,
    image,
    visualContent,
    votes,
    comments,
    isSpoiler,
    isPromoted,
    onImageClick,
    navPath,
    hidePrefixes,
    customMetadata,
    customFooter
}: PostCardProps) {
    return (
        <div className="bg-reddit-card hover:bg-[var(--color-reddit-card)] rounded-[var(--radius-xl)] border border-reddit-border hover:border-reddit-meta cursour-pointer transition-colors overflow-hidden">
            {/* Main Content Container */}
            <div className="flex flex-col p-2">

                {/* Header: Subreddit, User, Time */}
                <div className="flex items-center gap-2 text-xs text-reddit-meta mb-2 pl-1 flex-wrap">
                    {/* Placeholder for Subreddit Icon - Hidden if hiding prefixes to be cleaner */}
                    {!hidePrefixes && <div className="w-6 h-6 rounded-full bg-reddit-meta/20"></div>}

                    <span className="font-bold text-black hover:underline">
                        {hidePrefixes ? subreddit.replace('r/', '') : subreddit}
                    </span>
                    <span>•</span>
                    <span className="hover:underline cursor-pointer">
                        {hidePrefixes ? author : `u/${author}`}
                    </span>
                    <span>•</span>
                    {customMetadata && (
                        <>
                            <span className="font-medium text-black">{customMetadata}</span>
                            <span>•</span>
                        </>
                    )}
                    <span>{time}</span>
                    {isPromoted && <span className="text-reddit-blue font-bold text-[10px] border border-reddit-blue px-1 rounded-sm">Promoted</span>}
                </div>

                {/* Title */}
                <Link href={navPath || `/r/${subreddit.replace('r/', '')}/comments/${id}`} className="block mb-2 pl-1 pr-2">
                    <h3 className="text-lg font-medium text-reddit-text leading-snug hover:underline">
                        {title}
                    </h3>
                </Link>

                {/* Content (Text or Image) */}
                <div className="mb-2">
                    {content && !image && !visualContent && <p className="text-sm text-reddit-text px-1 pb-2">{content}</p>}

                    {(image || visualContent) && (
                        <div
                            className={clsx(
                                "relative mt-2 rounded-[var(--radius-lg)] overflow-hidden border border-reddit-border bg-black/5 flex justify-center items-center cursor-pointer hover:opacity-95 transition-opacity",
                                image ? "min-h-[400px]" : "min-h-[300px]"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                if (onImageClick) onImageClick();
                            }}
                        >
                            {/* Visual Content (Text-as-Image or Custom Component) */}
                            {visualContent ? (
                                <div className="w-full h-full min-h-[300px] p-6 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-center">
                                    <div className="prose dark:prose-invert max-w-none text-lg font-medium">
                                        {visualContent}
                                    </div>
                                    {navPath && (
                                        <div className="mt-4 text-sm font-bold text-blue-600 hover:underline">
                                            Read Details →
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Standard Image */
                                <>
                                    {image?.startsWith('http') || image?.startsWith('/') ? (
                                        <img src={image} alt="Post Content" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400 text-sm">Image Content ({image})</div>
                                    )}
                                </>
                            )}

                            {isSpoiler ? (
                                <div className="absolute inset-0 bg-gray-200/90 backdrop-blur-md flex items-center justify-center z-10 cursor-pointer hover:bg-gray-200/80 transition-colors">
                                    <button className="bg-reddit-meta/20 text-reddit-text px-4 py-1.5 rounded-full text-xs font-bold border border-reddit-text/20 backdrop-blur-sm">
                                        Click to see spoiler
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Interaction Footer (Pill Style) */}
                <div className="flex items-center gap-2 text-reddit-meta text-xs font-bold pl-1">
                    {customFooter ? customFooter : (
                        <>
                            {/* Vote Pill */}
                            {!isPromoted && (
                                <div className="flex items-center bg-reddit-input-bg rounded-full overflow-hidden hover:bg-gray-200 transition-colors">
                                    <button className="p-1.5 px-2 hover:bg-gray-300/50 hover:text-reddit-primary transition-colors">
                                        <ArrowBigUp size={20} strokeWidth={1.5} />
                                    </button>
                                    <span className="text-xs px-1 text-black">{votes}</span>
                                    <button className="p-1.5 px-2 hover:bg-gray-300/50 hover:text-blue-600 transition-colors">
                                        <ArrowBigDown size={20} strokeWidth={1.5} />
                                    </button>
                                </div>
                            )}

                            {/* Comment Pill */}
                            <button className="flex items-center gap-2 bg-reddit-input-bg px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                <MessageSquare size={18} strokeWidth={1.5} />
                                <span>{comments}</span>
                            </button>

                            {/* Share Pill */}
                            <button className="flex items-center gap-2 bg-reddit-input-bg px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                <Share2 size={18} strokeWidth={1.5} />
                                <span>Share</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
