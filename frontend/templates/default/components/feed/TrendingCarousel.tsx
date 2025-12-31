'use client';

import { TrendingUp } from 'lucide-react';

export default function TrendingCarousel() {
    const trendingItems = [
        {
            id: 1,
            title: "SpaceX Starship Launch",
            subtitle: "r/space • 4h ago",
            image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop",
        },
        {
            id: 2,
            title: "New AI Model Released",
            subtitle: "r/technology • 2h ago",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        },
        {
            id: 3,
            title: "Championship Finals",
            subtitle: "r/sports • 5h ago",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop",
        },
        {
            id: 4,
            title: "Global Economic Summit",
            subtitle: "r/economics • 8h ago",
            image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1000&auto=format&fit=crop",
        }
    ];

    return (
        <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 px-1 flex items-center gap-2">
                <TrendingUp size={16} />
                Trending Today
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide-default snap-x">
                {trendingItems.map((item) => (
                    <div
                        key={item.id}
                        className="relative min-w-[250px] h-[180px] rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow snap-center bg-gray-800"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                        <img
                            src={item.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 right-3 z-20">
                            <h3 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2">{item.title}</h3>
                            <p className="text-xs text-gray-300 font-medium">{item.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
