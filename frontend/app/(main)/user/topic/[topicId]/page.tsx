'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopicDetailView from '@/templates/default/components/topics/TopicDetailView';

export default function UserTopicPage() {
    const params = useParams();
    const { topicId } = params as { topicId: string };
    const { user } = useAuth();

    // Get primary organization for the current user
    const primaryOrg = user?.organizations?.[0];

    // Note: We wait for user/primaryOrg to be loaded. 
    // TopicDetailView handles loading state if orgId is null initially.

    return (
        <TopicDetailView
            orgId={primaryOrg?.id}
            topicId={topicId}
            backPath="/user"
        />
    );
}
