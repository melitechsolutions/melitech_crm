import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";

const SalesManagerDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Sales Manager Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Month Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 2.4M</div>
            <p className="text-xs text-gray-600 mt-1">Target: KES 2.5M +12%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-gray-600 mt-1">Pipeline value +5</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-gray-600 mt-1">YTD new: 8 +3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32%</div>
            <p className="text-xs text-gray-600 mt-1">This month +2%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <div className="space-y-4">
                {[
                  { stage: "Prospecting", count: 12, value: "KES 450K" },
                  { stage: "Qualification", count: 8, value: "KES 320K" },
                  { stage: "Proposal", count: 5, value: "KES 280K" },
                  { stage: "Negotiation", count: 3, value: "KES 150K" },
                ].map((item) => (
                  <div key={item.stage} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.stage}</p>
                      <p className="text-xs text-gray-600">{item.count} opportunities</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sales Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <div className="space-y-4">
                {[
                  { client: "Acme Corp", estimate: "EST-2024-045", value: "KES 850K", status: "Sent" },
                  { client: "Global Industries", estimate: "EST-2024-044", value: "KES 720K", status: "In Discussion" },
                  { client: "Tech Innovations", estimate: "EST-2024-043", value: "KES 620K", status: "Pending" },
                ].map((quote) => (
                  <div key={quote.estimate} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{quote.client}</p>
                      <p className="text-xs text-gray-600">{quote.estimate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{quote.value}</p>
                      <Badge variant={quote.status === "Sent" ? "outline" : "secondary"}>{quote.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sales Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">KES 425K</p>
            <p className="text-xs text-gray-600 mt-2">↑ 8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sales Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">42 days</p>
            <p className="text-xs text-gray-600 mt-2">Average time to close</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">32%</p>
            <p className="text-xs text-gray-600 mt-2">Industry avg: 28%</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesManagerDashboard;
