import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import OverduePaymentDashboard from "@/components/OverduePaymentDashboard";

/**
 * OverduePayments Page
 * 
 * Dedicated page for managing overdue invoice payments
 * - Display all overdue invoices
 * - Send payment reminders (1st, 2nd, final)
 * - Track reminder history
 * - Bulk operations for reminders
 */
export default function OverduePaymentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Overdue Payments Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage overdue invoices. Send reminders to encourage timely payment and improve cash flow.
          </p>
        </div>

        <OverduePaymentDashboard />
      </div>
    </DashboardLayout>
  );
}
