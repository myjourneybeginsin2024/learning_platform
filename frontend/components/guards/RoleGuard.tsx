"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[]; // 'super_admin', 'org_admin', 'user'
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        if (user) {
            console.log("RoleGuard: Checking access", { userRole: user.role, allowedRoles });
            let hasPermission = false;

            // Check for super_admin
            if (allowedRoles.includes('super_admin') && user.role === 'super_admin') {
                hasPermission = true;
            }

            // Check for org_admin
            if (allowedRoles.includes('org_admin')) {
                if (user.organizations?.some(org => org.role === 'admin')) {
                    hasPermission = true;
                }
            }

            // Also check if user is super admin, they usually have access to everything?
            // For now, explicit check. If I want super admin to access org pages, I should add 'super_admin' to allowedRoles there too.

            // Check for basic user access
            if (allowedRoles.includes('user')) {
                hasPermission = true;
            }

            if (hasPermission) {
                setAuthorized(true);
            } else {
                console.log("RoleGuard: Access Denied", { userRole: user?.role, allowedRoles });
                router.push("/user");
            }
        }
    }, [user, isLoading, isAuthenticated, router, allowedRoles]);

    if (isLoading || !authorized) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return <>{children}</>;
}
