import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PaymentReports from "@/components/PaymentReports";
import { Loader2, BarChart3 } from "lucide-react";

/**
 * PaymentReportsPage
 * 
 * Full-screen page for viewing payment reports with filters and exports
 */
export default function PaymentReportsPage() {
  const { user, loading, isAuthenticated, logout } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role) {
      // Check if user has permission to view reports
      // Add role check if needed in future
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <DashboardLayout
      title="Payment Reports"
      user={user}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Payment Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Analyze payment trends and generate detailed reports
            </p>
          </div>
        </div>

        {/* Main Content */}
        <PaymentReports />
      </div>
    </DashboardLayout>
  );
}
