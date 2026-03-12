import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  Loader2,
  AlertCircle,
  FolderKanban,
  FileText,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  CreditCard,
  UserCog,
  ArrowRight,
  Truck,
  CheckSquare,
  LineChart,
  Mail,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

/**
 * SuperAdminDashboard component
 * 
 * Displays:
 * - CRM Introduction
 * - Quick access cards to all major modules
 * - For system admin functionality, see /admin/management
 */
export default function SuperAdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });
  const [, setLocation] = useLocation();

  // Fetch dashboard metrics from backend
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.dashboard.metrics.useQuery();

  // Convert frozen Drizzle objects to plain objects to avoid React error #306
  const metricsPlain = metrics ? JSON.parse(JSON.stringify(metrics)) : null;

  useEffect(() => {
    // Verify user has super_admin or admin role
    if (!loading && isAuthenticated && user?.role !== "super_admin" && user?.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading || metricsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "super_admin" && user?.role !== "admin")) {
    return null;
  }

  // Logout handler
  async function handleLogout() {
    await logout();
    setLocation("/login");
  }

  if (metricsError) {
    return (
      <DashboardLayout
        title="Dashboard"
        user={user}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600">{metricsError.message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Module features for navigation - COMPLETE LIST with all modules
  const features = [
    {
      title: "Projects",
      description: "Manage and track all your projects",
      icon: FolderKanban,
      href: "/projects",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Clients",
      description: "Client relationship management",
      icon: Users,
      href: "/clients",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Invoices",
      description: "Create and manage invoices",
      icon: FileText,
      href: "/invoices",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Estimates",
      description: "Generate quotations and estimates",
      icon: Receipt,
      href: "/estimates",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Payments",
      description: "Track payments and transactions",
      icon: DollarSign,
      href: "/payments",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Expenses",
      description: "Monitor and manage expenses",
      icon: CreditCard,
      href: "/expenses",
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-950",
    },
    {
      title: "Products",
      description: "Product catalog management",
      icon: Package,
      href: "/products",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      title: "Services",
      description: "Service offerings catalog",
      icon: Briefcase,
      href: "/services",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      title: "Procurement",
      description: "Purchase orders and requests",
      icon: Truck,
      href: "/procurement",
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
    {
      title: "Accounting",
      description: "Financial management and reports",
      icon: LineChart,
      href: "/accounting",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950",
    },
    {
      title: "Reports",
      description: "Analytics and insights",
      icon: BarChart3,
      href: "/reports",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "HR",
      description: "Human resources management",
      icon: UserCog,
      href: "/hr",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950",
    },
    {
      title: "Approvals",
      description: "Manage approval workflows",
      icon: CheckSquare,
      href: "/approvals",
      color: "text-lime-500",
      bgColor: "bg-lime-50 dark:bg-lime-950",
    },
    {
      title: "Communications",
      description: "Email, SMS, and messaging",
      icon: Mail,
      href: "/communications",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      user={user}
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        {/* CRM Introduction Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome to Melitech CRM</h1>
          <p className="text-lg opacity-90 mb-4">
            A comprehensive business management system designed to streamline your operations and boost productivity.
          </p>
          <div className="flex gap-4">
            <Button 
              variant="secondary"
              onClick={() => setLocation("/admin/management")}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              System Administration
            </Button>
            <Button 
              className="bg-white text-slate-900 hover:bg-gray-100"
              onClick={() => setLocation("/crm")}
            >
              Go to Dashboard Home
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsPlain?.totalProjects || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsPlain?.totalClients || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Active clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsPlain?.activeClients || 0}</div>
              <p className="text-xs text-gray-500 mt-1">System users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Operational</div>
              <p className="text-xs text-gray-500 mt-1">All systems healthy</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Access Grid */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Quick Access</h2>
            <p className="text-gray-600">Access all modules from one place</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.href}
                  className="cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50"
                  onClick={() => setLocation(feature.href)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="mt-4 text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full group-hover:bg-accent">
                      Open {feature.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
