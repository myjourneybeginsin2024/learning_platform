'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import PostCard from '@/templates/default/components/feed/PostCard';
import MediaViewer from '@/templates/default/components/feed/MediaViewer';
import TrendingCarousel from '@/templates/default/components/feed/TrendingCarousel';
// Import Topic interface (ensure it is exported in OrgTopicCarousel)
import OrgTopicCarousel, { Topic } from '@/templates/default/components/feed/OrgTopicCarousel';
import { RightSidebar } from '@/templates/default/components/layout/RightSidebar';
import HomeInfoCard from '@/templates/default/components/feed/HomeInfoCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Share2, MessageSquare, FileText, Bot } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const primaryOrg = user?.organizations?.[0];
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopicId = searchParams.get('topicId');

  console.log("DEBUG: UserDashboardPage", { userOrgCount: user?.organizations?.length, primaryOrg, initialTopicId });

  // State for Doom Scroll Feed
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Deep Link Logic: If topicId param exists, fetch and open it
  useEffect(() => {
    async function loadDeepLinkedTopic() {
      if (initialTopicId && primaryOrg && !selectedTopic) {
        try {
          // Fetch specific topic details
          const topic = await apiFetch(`/admin/organizations/${primaryOrg.id}/topics/${initialTopicId}`);
          if (topic) {
            setSelectedTopic(topic);
            // Optional: Clean up URL without reload?
            // router.replace('/user'); 
            // No, keeping it is better for refresh persistence.
          }
        } catch (error) {
          console.error("Failed to load deep-linked topic:", error);
        }
      }
    }
    loadDeepLinkedTopic();
  }, [initialTopicId, primaryOrg]); // Run when these change

  const [mediaViewerData, setMediaViewerData] = useState<{ isOpen: boolean, url: string, title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const openMedia = (url: string, title: string) => {
    setMediaViewerData({ isOpen: true, url, title });
  };

  const closeMedia = () => {
    setMediaViewerData(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4 max-w-[1200px] mx-auto">
        {primaryOrg ? (
          <OrgTopicCarousel
            orgId={primaryOrg.id}
            basePath="/user/topic"
            onTopicSelect={(topic) => {
              console.log("Topic Selected for Feed:", topic.title);
              setSelectedTopic(topic);
            }}
          />
        ) : (
          <TrendingCarousel />
        )}

        {/* Mobile-only Home/Create Section */}
        <div className="lg:hidden">
          <HomeInfoCard />
        </div>

        <div className="flex gap-6 relative">
          {/* Main Content Feed */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* If Topic Selected: Show Topic Segments as Feed (Doom Scroll Mode) */}
            {selectedTopic ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    ← Back to Feed
                  </button>
                </div>

                {selectedTopic.modules.map((module, idx) => {
                  // Logic: Use uploaded image OR generate one dynamically
                  const imageUrl = module.image_url
                    ? module.image_url
                    : `/api/og?title=${encodeURIComponent(module.title)}&content=${encodeURIComponent(module.content.substring(0, 800))}&segment=${idx + 1}&org=${encodeURIComponent(primaryOrg?.name || 'Organization')}`;

                  return (
                    <PostCard
                      key={module.id}
                      id={`topic/${selectedTopic.id}#module-${module.id}`}
                      navPath={`/user/topic/${selectedTopic.id}/segment/${module.id}`}
                      subreddit={selectedTopic.title}
                      author={primaryOrg?.name || "Organization"}
                      hidePrefixes={true}
                      customMetadata={`Segment ${idx + 1}`}
                      time="Just now"
                      title={module.title}
                      image={imageUrl}
                      content={!module.image_url ? undefined : module.content}
                      votes="--"
                      comments="--"
                      onImageClick={() => openMedia(imageUrl, module.title)}
                      customFooter={
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert("AI Chat feature coming soon!")}
                            className="flex items-center gap-2 bg-reddit-input-bg px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors text-reddit-meta text-xs font-bold"
                          >
                            <Bot size={16} />
                            <span>Chat AI</span>
                          </button>
                          <button
                            onClick={() => alert("Notes feature coming soon!")}
                            className="flex items-center gap-2 bg-reddit-input-bg px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors text-reddit-meta text-xs font-bold"
                          >
                            <FileText size={16} />
                            <span>Notes</span>
                          </button>
                          <button
                            onClick={() => alert("Share feature coming soon!")}
                            className="flex items-center gap-2 bg-reddit-input-bg px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors text-reddit-meta text-xs font-bold"
                          >
                            <Share2 size={16} />
                            <span>Share</span>
                          </button>
                        </div>
                      }
                    />
                  );
                })}

                <div className="p-8 text-center text-gray-500 text-sm">
                  You've reached the end of this topic!
                  <br />
                  <button onClick={() => setSelectedTopic(null)} className="text-purple-600 hover:underline mt-2">
                    Explore other topics
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Feed (Trending / Best / Hot) */
              <div className="space-y-4">
                {/* Feed Filter (Best / Hot / New) */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                  <button className="px-4 py-1.5 rounded-[var(--radius-pill)] bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap">Best</button>
                  <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">Hot</button>
                  <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">New</button>
                  <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">Top</button>
                </div>

                <PostCard
                  id="1"
                  subreddit="r/ArcRaiders"
                  author="Foxeeh_"
                  time="2d ago"
                  title="Embark can people that willingly reset hundred of hours of progress get the ACTUAL tutorial outfit instead of a changed up, goofy version of it?"
                  votes="700"
                  comments="470"
                  image="/assets/content-main.jpg"
                  onImageClick={() => openMedia('/assets/content-main.jpg', 'Embark can people that willingly reset hundred of hours of progress get the ACTUAL tutorial outfit?')}
                />

                <PostCard
                  id="2"
                  subreddit="r/webdev"
                  author="frontend_wizard"
                  time="5 hours ago"
                  title="I recreated Reddit using Next.js and Tailwind CSS!"
                  content="It was a fun challenge. I used the new Tailwind v4 alpha and the developer experience is insane."
                  votes="12k"
                  comments="45"
                />

                <PostCard
                  id="3"
                  subreddit="r/nextjs"
                  author="vercel_fan"
                  time="2 hours ago"
                  title="Server Actions are confusing?"
                  votes="5.4k"
                  comments="120"
                  image="Placeholder"
                  onImageClick={() => openMedia('Placeholder_Image_Url', 'Server Actions are confusing?')}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - Now inside page layout but below carousel visually */}
          <div className="hidden lg:block w-[312px] shrink-0">
            <RightSidebar showHomeCard={true} />
          </div>
        </div>

        <MediaViewer
          isOpen={mediaViewerData.isOpen}
          onClose={closeMedia}
          imageUrl={mediaViewerData.url}
          title={mediaViewerData.title}
        />
      </div>
    </ProtectedRoute>
  );
}
