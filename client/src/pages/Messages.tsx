import React from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { MessageSquare } from "lucide-react";

/**
 * Messages page - Communication center for users
 */
export default function Messages() {
  return (
    <ModuleLayout
      title="Messages"
      description="View and manage your messages"
      icon={<MessageSquare className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Messages" },
      ]}
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Messages
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No messages yet. Check back later for communications.
          </p>
        </div>
      </div>
    </ModuleLayout>
  );
}
