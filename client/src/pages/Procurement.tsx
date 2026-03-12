import { useState, useEffect } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, FileText, Truck, BarChart3, Plus, Package } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Procurement() {
  const [, navigate] = useLocation();
  const [procurementData, setProcurementData] = useState({
    totalRequests: 0,
    totalOrders: 0,
    totalSpend: 0,
    activeVendors: 0,
  });

  // Fetch procurement data from backend
  const { data: requests = [] } = trpc.procurement.list.useQuery();
  const { data: purchaseOrders = [] } = trpc.lpo.list.useQuery();
  const { data: vendors = [] } = trpc.suppliers?.list?.useQuery?.() || { data: [] };

  // Calculate procurement metrics
  useEffect(() => {
    // Defensive check to ensure all data is available and is an array before proceeding
    if (!Array.isArray(requests) || !Array.isArray(purchaseOrders)) {
      return;
    }
    
    const totalSpend = (purchaseOrders as any[]).reduce((sum, po) => sum + (po.amount || 0), 0) / 100;
    const vendorSet = new Set((purchaseOrders as any[]).map((po: any) => po.vendorId).filter(Boolean));

    setProcurementData({
      totalRequests: requests.length,
      totalOrders: purchaseOrders.length,
      totalSpend,
      activeVendors: vendorSet.size,
    });
  }, [requests, purchaseOrders, vendors]);

  const procurementModules = [
    {
      title: "Purchase Requests",
      description: "Create and manage procurement requisitions",
      icon: ShoppingCart,
      href: "/procurement/requests",
      stats: { label: "Total Requests", value: procurementData.totalRequests.toString() },
    },
    {
      title: "Purchase Orders",
      description: "Track and manage purchase orders",
      icon: FileText,
      href: "/procurement/orders",
      stats: { label: "Active Orders", value: procurementData.totalOrders.toString() },
    },
    {
      title: "Suppliers",
      description: "Manage vendor and supplier information",
      icon: Truck,
      href: "/suppliers",
      stats: { label: "Active Vendors", value: procurementData.activeVendors.toString() },
    },
    {
      title: "Inventory",
      description: "Track stock levels and warehouse management",
      icon: Package,
      href: "/inventory",
      stats: { label: "SKUs", value: "0" },
    },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Procurement", href: "/procurement" },
      ]}
      title="Procurement"
      description="Manage purchase requests, orders, and supplier relationships"
      icon={<ShoppingCart className="w-6 h-6" />}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/procurement/create-request")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
          <Button onClick={() => navigate("/procurement/create-po")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Purchase Order
          </Button>
          <Button onClick={() => navigate("/suppliers/create")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Supplier
          </Button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{procurementData.totalRequests}</div>
              <p className="text-xs text-gray-500 mt-1">Active requisitions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{procurementData.totalOrders}</div>
              <p className="text-xs text-gray-500 mt-1">Purchase orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {(procurementData.totalSpend).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-gray-500 mt-1">YTD procurement spend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{procurementData.activeVendors}</div>
              <p className="text-xs text-gray-500 mt-1">Vendor relationships</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {procurementModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card
                key={module.href}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(module.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <CardDescription className="text-xs">{module.description}</CardDescription>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-bold">{module.stats.value}</div>
                      <p className="text-xs text-gray-500">{module.stats.label}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(module.href);
                      }}
                    >
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ModuleLayout>
  );
}
