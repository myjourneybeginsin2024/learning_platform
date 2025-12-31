import Link from 'next/link';
import CommunityWidget from './CommunityWidget';

export function RightSidebar({ showHomeCard = true }: { showHomeCard?: boolean }) {
    return (
        <aside className="w-[312px] shrink-0 h-screen sticky top-14 overflow-y-auto p-4 scrollbar-hide-default">
            {/* Home Info Card */}
            {showHomeCard && (
                <div className="bg-reddit-card border border-reddit-border rounded-md mb-4">
                    {/* Banner */}
                    <div className="h-8 bg-reddit-bg rounded-t-md"></div>
                    <div className="px-3 pb-3">
                        <div className="flex items-center gap-2 mb-2 pt-2">
                            <span className="font-bold text-base text-reddit-text">Home</span>
                        </div>
                        <p className="text-sm text-reddit-text mb-4">
                            Your personal frontpage. Come here to check in with your favorite communities.
                        </p>
                        <div className="flex flex-col gap-2">
                            <input type="file" className="hidden" id="rs-file-upload" />
                            <label
                                htmlFor="rs-file-upload"
                                className="w-full py-1.5 bg-reddit-blue text-white rounded-full font-bold hover:bg-reddit-blue-hover transition-colors cursor-pointer text-center block"
                            >
                                Upload Doc
                            </label>
                            <button className="w-full py-1.5 border border-reddit-blue text-reddit-blue rounded-full font-bold hover:bg-blue-50 transition-colors">
                                Input Topic
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popular Communities */}
            <div className="bg-reddit-card border border-reddit-border rounded-md p-3 mb-4">
                <h3 className="text-xs font-bold text-reddit-meta uppercase mb-3">Popular Communities</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-reddit-meta/20 overflow-hidden">
                            <img src="https://styles.redditmedia.com/t5_2qnts/styles/communityIcon_1ray2wo7lucha.png" alt="r/AskMen" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-black hover:underline">r/AskMen</span>
                            <span className="text-xs text-reddit-meta">7,119,708 members</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-pink-500 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
                            ?
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-black hover:underline">r/AskWomen</span>
                            <span className="text-xs text-reddit-meta">5,594,546 members</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-blue-700 overflow-hidden flex items-center justify-center text-white">
                            <img src="https://styles.redditmedia.com/t5_2wlj3/styles/communityIcon_7j7b282k6t161.png" alt="r/PS4" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-black hover:underline">r/PS4</span>
                            <span className="text-xs text-reddit-meta">5,510,886 members</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex items-center justify-center text-white">
                            <img src="https://styles.redditmedia.com/t5_2qh1f/styles/communityIcon_f9909289-498c-4573-979a-8c734493f666.png" alt="r/apple" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-black hover:underline">r/apple</span>
                            <span className="text-xs text-reddit-meta">6,296,217 members</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-orange-700 overflow-hidden flex items-center justify-center text-white text-xs">
                            <img src="https://styles.redditmedia.com/t5_2s84e/styles/communityIcon_51lbe57579881.png" alt="r/NBA2k" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-black hover:underline">r/NBA2k</span>
                            <span className="text-xs text-reddit-meta">742,991 members</span>
                        </div>
                    </div>
                </div>
                <button className="w-full mt-4 text-xs font-bold text-black hover:underline text-left">See more</button>
            </div>

            {/* NEW: Community Widget */}
            <CommunityWidget />

            {/* Footer */}
            <div className="mt-4 px-2">
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-reddit-meta border-t border-reddit-border pt-4">
                    <Link href="#" className="hover:underline">User Agreement</Link>
                    <Link href="#" className="hover:underline">Privacy Policy</Link>
                    <Link href="#" className="hover:underline">Content Policy</Link>
                    <Link href="#" className="hover:underline">Moderator Code of Conduct</Link>
                </div>
                <div className="mt-4 text-[11px] text-reddit-meta">
                    Noleij, Inc. © 2025. All rights reserved.
                </div>
            </div>
        </aside>
    );
}
