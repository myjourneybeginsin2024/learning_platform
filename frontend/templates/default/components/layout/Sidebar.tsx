'use client';

import Link from 'next/link';
import { Home, TrendingUp, Compass, ChevronDown, Gamepad2, Settings, Plus } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export function Sidebar() {
    const { isSidebarOpen } = useSidebar();

    return (
        <aside
            className={`
                hidden lg:block shrink-0 h-[calc(100vh-56px)] sticky top-14 
                transition-[width] duration-300 ease-in-out z-0 overflow-hidden
                ${isSidebarOpen ? 'w-[270px]' : 'w-0'}
            `}
        >
            <div className={`w-[270px] h-full overflow-y-auto scrollbar-hide-default bg-reddit-card border-r border-reddit-border transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4">
                    {/* Content wrapper with padding now inside */}

                    {/* Feeds */}
                    <div className="mb-4 border-b border-reddit-border pb-4 mx-3">
                        <div className="flex flex-col space-y-0.5">
                            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 font-medium text-reddit-text text-sm">
                                <Home className="w-5 h-5" /> Home
                            </Link>
                            <Link href="/popular" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <TrendingUp className="w-5 h-5" /> Popular
                            </Link>
                            <Link href="/explore" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <Compass className="w-5 h-5" /> Explore
                            </Link>
                            <Link href="/all" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none">∞</div> All
                            </Link>
                            <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <Plus className="w-5 h-5" /> Start a community
                            </button>
                        </div>
                    </div>

                    {/* Learning Communities */}
                    <div className="mb-4 border-b border-reddit-border pb-4 mx-3">
                        <div className="flex items-center justify-between px-3 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md py-1 group">
                            <h3 className="text-[10px] font-bold text-reddit-meta uppercase tracking-wider">Learning Communities</h3>
                            <ChevronDown size={16} className="text-reddit-meta group-hover:block" />
                        </div>

                        <div className="flex flex-col space-y-0.5">
                            <Link href="/r/webdev" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">W</div> Web Dev
                            </Link>
                            <Link href="/r/python" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px]">P</div> Python
                            </Link>
                            <Link href="/r/data" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">D</div> Data Science
                            </Link>
                            <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <Plus className="w-5 h-5 text-reddit-meta" /> Join specific course...
                            </button>
                        </div>
                    </div>

                    {/* Custom Feeds */}
                    <div className="mb-4 border-b border-reddit-border pb-4 mx-3">
                        <div className="flex items-center justify-between px-3 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md py-1 group">
                            <h3 className="text-[10px] font-bold text-reddit-meta uppercase tracking-wider">Custom Feeds</h3>
                            <ChevronDown size={16} className="text-reddit-meta" />
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <Plus className="w-5 h-5" /> Create Custom Feed
                            </button>
                        </div>
                    </div>

                    {/* Tools */}
                    <div className="mb-4 border-b border-reddit-border pb-4 mx-3">
                        <div className="flex items-center justify-between px-3 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md py-1 group">
                            <h3 className="text-[10px] font-bold text-reddit-meta uppercase tracking-wider">Tools</h3>
                            <ChevronDown size={16} className="text-reddit-meta" />
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <Settings className="w-5 h-5" /> Settings
                            </button>
                        </div>
                    </div>

                    {/* Resources Footer */}
                    <div className="mb-6 mx-3 px-3">
                        <div className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-100 rounded-md py-1 group">
                            <h3 className="text-[10px] font-bold text-reddit-meta uppercase tracking-wider">Resources</h3>
                            <ChevronDown size={16} className="text-reddit-meta" />
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><img src="https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png" className="w-4 h-4" alt="" /></div> About Reddit
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg></div> Advertise
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div> Developer Platform
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center opacity-60 text-orange-500 font-bold"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></div> Reddit Pro <span className="ml-1 text-[9px] text-reddit-primary font-bold uppercase">BETA</span>
                            </Link>
                            <div className="border-t border-reddit-border my-2"></div>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div> Help
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg></div> Blog
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div> Careers
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-reddit-text text-sm">
                                <div className="w-5 h-5 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div> Press
                            </Link>
                        </div>

                        <div className="border-t border-reddit-border mt-4 pt-4 px-3">
                            <div className="flex flex-col gap-1 text-[11px] text-reddit-meta">
                                <div className="flex gap-2">
                                    <Link href="#" className="hover:underline">Reddit Rules</Link>
                                    <Link href="#" className="hover:underline">Privacy Policy</Link>
                                </div>
                                <div className="flex gap-2">
                                    <Link href="#" className="hover:underline">User Agreement</Link>
                                </div>
                            </div>
                            <div className="mt-4 text-[11px] text-reddit-meta">
                                Reddit, Inc. © 2025. All rights reserved.
                            </div>
                        </div>
                    </div>

                </div> {/* End padding wrapper */}
            </div>{/* End fixed width container */}
        </aside>
    );
}
