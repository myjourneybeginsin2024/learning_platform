import ProtectedRoute from "@/components/ProtectedRoute";


export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white dark:!bg-[#1A1A1B] min-h-[calc(100vh-100px)] rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:!ring-[#343536]">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-reddit-text mb-4">Super Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-reddit-meta">Welcome to the super administration area.</p>
        {/* Page specific content goes here */}
      </div>
    </ProtectedRoute>
  );
}
