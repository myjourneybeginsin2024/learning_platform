"use client";
import RoleGuard from "@/components/guards/RoleGuard";

export default function SettingsPage() {
    return (
        <RoleGuard allowedRoles={['super_admin']}>
            <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text">Settings</h1>
                        <p className="text-gray-600 dark:text-reddit-meta">Global platform configuration</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                        <span className="text-4xl">⚙️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Global Settings Coming Soon</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">
                        Configure global platform variables, feature flags, and system-wide preferences here.
                    </p>
                </div>
            </div>
        </RoleGuard>
    );
}
