'use client';

import { useParams } from 'next/navigation';
import TopicDetailView from '@/templates/default/components/topics/TopicDetailView';

export default function TopicDetailPage() {
    const params = useParams();
    // Folder is [id] (orgId) and [topicId]
    const { id: orgId, topicId } = params as { id: string; topicId: string };

    return (
        <TopicDetailView
            orgId={orgId}
            topicId={topicId}
        />
    );
}
