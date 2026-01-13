'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from './SidebarContext';

// Import our new separate sidebar components
import { DefaultSidebar } from '../sidebar/DefaultSidebar';
import { SuperAdminSidebar } from '../sidebar/SuperAdminSidebar';
import { OrgAdminSidebar } from '../sidebar/OrgAdminSidebar';
import { AdminLandingSidebar } from '../sidebar/AdminLandingSidebar';

export function MainSidebar() {
    const { isSidebarOpen } = useSidebar();
    const { user } = useAuth();
    const pathname = usePathname();
    const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'super admin';

    // Helper: Get user's admin orgs
    const adminOrgs = user?.organizations?.filter(o => o.role === 'admin') || [];

    // -------------------------------------------------------------------------
    // DISPATCHER LOGIC: Decide which sidebar to render based on path & role
    // -------------------------------------------------------------------------


    let SidebarContent;

    if (pathname?.startsWith('/superadmin') && isSuperAdmin) {
        // 1. Super Admin Pages -> SuperAdminSidebar
        SidebarContent = SuperAdminSidebar;
    } else if (pathname?.startsWith('/admin/org/')) {
        // 2a. Specific Organization Context -> OrgAdminSidebar
        SidebarContent = OrgAdminSidebar;
    } else if (pathname?.startsWith('/admin')) {
        // 2b. General Admin Dashboard
        // IMPROVEMENT: If user manages exactly 1 org (or we just pick the first one), 
        // show that sidebar immediately to avoid "menuless" feeling.
        if (adminOrgs.length > 0) {
            // Force render OrgSidebar with the first Org ID
            SidebarContent = () => <OrgAdminSidebar preSelectedOrgId={adminOrgs[0].id.toString()} />;
        } else {
            SidebarContent = AdminLandingSidebar;
        }
    } else if (pathname?.startsWith('/user')) {
        // 3. User Dashboard Pages (Placeholder) -> DefaultSidebar
        SidebarContent = DefaultSidebar;
    } else {
        // 4. Default / Fallback -> DefaultSidebar (Home, Profile, Login, etc.)
        SidebarContent = DefaultSidebar;
    }

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
                    <SidebarContent />
                </div>
            </div>
        </aside>
    );
}
