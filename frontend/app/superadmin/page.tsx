import ProtectedRoute from "@/components/ProtectedRoute";
import UserHeader from "@/components/UserHeader";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <UserHeader />
      <main className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome to the Super Admin Dashboard</h1>
        {/* Page specific content goes here */}
      </main>
    </ProtectedRoute>
  );
}
