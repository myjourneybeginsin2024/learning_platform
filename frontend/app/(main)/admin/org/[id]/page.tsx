"use client";
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, FileText, BookOpen, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function OrgDashboardOverview() {
    const params = useParams();
    const orgId = params?.id;
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const currentOrg = user?.organizations?.find(o => o.id.toString() === orgId);

    useEffect(() => {
        if (!orgId) return;
        const fetchStats = async () => {
            try {
                // In real app, call API. For now, we might get 404 if backend not ready, so mock fallback.
                // Actually backend IS ready.
                const data = await apiFetch(`/admin/organizations/${orgId}/stats`);
                setStats(data);
            } catch (e) {
                console.error("Failed to fetch stats", e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [orgId]);

    if (!user) return null; // RoleGuard wraps parent layout preferably

    return (
        <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text mb-2">
                {currentOrg?.name} Dashboard
            </h1>
            <p className="text-gray-500 mb-8">Manage your organization's learning ecosystem.</p>

            {loading ? (
                <div>Loading stats...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Employees"
                        value={stats?.total_users || 0}
                        icon={<Users className="w-6 h-6 text-blue-500" />}
                        link={`/admin/org/${orgId}/users`}
                    />
                    <StatCard
                        title="Active Topics"
                        value={stats?.active_topics || 0}
                        icon={<BookOpen className="w-6 h-6 text-green-500" />}
                        link={`/admin/org/${orgId}/topics`}
                    />
                    <StatCard
                        title="Knowledge Files"
                        value={stats?.total_files || 0}
                        icon={<FileText className="w-6 h-6 text-orange-500" />}
                        link={`/admin/org/${orgId}/files`}
                    />
                    <StatCard
                        title="Engagement"
                        value="--"
                        icon={<BarChart className="w-6 h-6 text-purple-500" />}
                        link={`/admin/org/${orgId}/analytics`}
                    />
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, link }: any) {
    return (
        <Link href={link} className="block p-4 border rounded-xl hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm font-medium">{title}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        </Link>
    )
}
