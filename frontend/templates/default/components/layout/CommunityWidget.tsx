'use client';

import Link from 'next/link';
import { ChevronUp } from 'lucide-react';

export default function CommunityWidget() {
    return (
        <div className="bg-reddit-card border border-reddit-border rounded-md mt-4">
            <div className="p-3">
                <h3 className="text-xs font-bold text-reddit-meta uppercase mb-3">Popular Communities</h3>

                <div className="space-y-4">
                    {[
                        { name: 'AskReddit', members: '42m', iconColor: 'bg-blue-500' },
                        { name: 'NoStupidQuestions', members: '4.5m', iconColor: 'bg-orange-500' },
                        { name: 'Damnthatsinteresting', members: '12m', iconColor: 'bg-green-500' },
                        { name: 'mildlyinteresting', members: '22m', iconColor: 'bg-purple-500' },
                        { name: 'todayilearned', members: '33m', iconColor: 'bg-blue-400' }
                    ].map((community, index) => (
                        <Link key={community.name} href={`/r/${community.name}`} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-sm w-4">{index + 1}</span>
                                <div className="flex items-center gap-2">
                                    <ChevronUp size={16} className="text-green-500" />
                                    <div className={`w-8 h-8 rounded-full ${community.iconColor} shrink-0`}></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold truncate max-w-[120px] group-hover:underline">r/{community.name}</span>
                                        <span className="text-xs text-reddit-meta">{community.members} members</span>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-reddit-blue text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-reddit-blue-hover">
                                Join
                            </button>
                        </Link>
                    ))}
                </div>

                <button className="w-full mt-4 py-2 text-sm font-bold text-black border border-transparent hover:bg-gray-100 rounded-full transition-colors">
                    See All
                </button>
            </div>
        </div>
    );
}
