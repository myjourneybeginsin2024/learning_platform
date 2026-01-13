'use client';

import { useParams } from 'next/navigation';
import RoleGuard from '@/components/guards/RoleGuard';
import TopicDetailView from '@/templates/default/components/topics/TopicDetailView';

export default function AdminTopicDetailPage() {
    const params = useParams();
    const orgId = params?.id as string;
    const topicId = params?.topicId as string;

    return (
        <RoleGuard allowedRoles={['org_admin']}>
            <TopicDetailView
                orgId={orgId}
                topicId={topicId}
                backPath={`/admin/org/${orgId}/topics`}
            />
        </RoleGuard>
    );
}
