import React from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Activity } from "lucide-react";

/**
 * Activity page - User activity log and system events
 */
export default function ActivityPage() {
  return (
    <ModuleLayout
      title="Activity"
      description="Monitor user activities and system events"
      icon={<Activity className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Activity" },
      ]}
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Activity Log
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No recent activities. Your activity log will appear here.
          </p>
        </div>
      </div>
    </ModuleLayout>
  );
}
