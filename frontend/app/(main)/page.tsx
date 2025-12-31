'use client';

import PostCard from '@/templates/default/components/feed/PostCard';
import MediaViewer from '@/templates/default/components/feed/MediaViewer';
import TrendingCarousel from '@/templates/default/components/feed/TrendingCarousel';
import { RightSidebar } from '@/templates/default/components/layout/RightSidebar';
import HomeInfoCard from '@/templates/default/components/feed/HomeInfoCard';
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeedPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [mediaViewerData, setMediaViewerData] = useState<{ isOpen: boolean, url: string, title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'super admin') router.replace('/superadmin');
      else if (user.role === 'admin') router.replace('/admin');
      else router.replace('/user');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const openMedia = (url: string, title: string) => {
    setMediaViewerData({ isOpen: true, url, title });
  };

  const closeMedia = () => {
    setMediaViewerData(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      <TrendingCarousel />

      {/* Mobile-only Home/Create Section */}
      <div className="lg:hidden">
        <HomeInfoCard />
      </div>

      <div className="flex gap-6 relative">
        {/* Main Content Feed */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Feed Filter (Best / Hot / New) */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            <button className="px-4 py-1.5 rounded-[var(--radius-pill)] bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap">Best</button>
            <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">Hot</button>
            <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">New</button>
            <button className="px-4 py-1.5 rounded-[var(--radius-pill)] text-reddit-meta font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">Top</button>
          </div>

          {/* Post List */}
          <div className="space-y-4">
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
  );
}
