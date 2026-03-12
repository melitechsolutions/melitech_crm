import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";

const ProcurementManagerDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Procurement Manager Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-600 mt-1">Pending approval +3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-600 mt-1">In transit +1</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-600 mt-1">Total partners</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-gray-600 mt-1">This month +5%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <div className="space-y-4">
                {[
                  { id: "PO-2024-001", supplier: "Tech Supplies Ltd", amount: "KES 125,000", status: "Pending" },
                  { id: "PO-2024-002", supplier: "Office Mart", amount: "KES 45,500", status: "Approved" },
                  { id: "PO-2024-003", supplier: "Logistics Co", amount: "KES 78,900", status: "Delivered" },
                ].map((po) => (
                  <div key={po.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{po.id}</p>
                      <p className="text-xs text-gray-600">{po.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{po.amount}</p>
                      <Badge variant={po.status === "Pending" ? "secondary" : "default"}>{po.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <div className="space-y-4">
                {[
                  { name: "Tech Supplies Ltd", rating: "4.8/5", orders: 42 },
                  { name: "Office Mart", rating: "4.6/5", orders: 38 },
                  { name: "Logistics Co", rating: "4.5/5", orders: 35 },
                ].map((supplier) => (
                  <div key={supplier.name} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{supplier.name}</p>
                      <p className="text-xs text-gray-600">{supplier.orders} orders</p>
                    </div>
                    <Badge variant="outline">{supplier.rating}</Badge>
                  </div>
                ))}
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProcurementManagerDashboard;
