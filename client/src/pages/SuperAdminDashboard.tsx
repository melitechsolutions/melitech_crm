import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Briefcase,
  FileText,
  DollarSign,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SuperAdminDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingTasks: 0,
    systemHealth: "Healthy",
    totalEmployees: 0,
  });

  // Fetch dashboard metrics
  const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery();

  useEffect(() => {
    if (dashboardMetrics) {
      setMetrics({
        totalUsers: (dashboardMetrics as any)?.totalUsers || 0,
        activeProjects: (dashboardMetrics as any)?.totalProjects || 0,
        pendingTasks: (dashboardMetrics as any)?.pendingInvoices || 0,
        systemHealth: "Healthy",
        totalEmployees: (dashboardMetrics as any)?.totalEmployees || 0,
      });
    }
  }, [dashboardMetrics]);

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: <Users className="w-8 h-8" />,
      href: "/settings",
      color: "from-blue-500 to-blue-600",
      stat: { label: "Total Users", value: metrics.totalUsers },
    },
    {
      title: "Project Management",
      description: "Create, manage, and assign projects",
      icon: <Briefcase className="w-8 h-8" />,
      href: "/projects",
      color: "from-cyan-500 to-blue-600",
      stat: { label: "Active Projects", value: metrics.activeProjects },
    },
    {
      title: "HR Management",
      description: "Manage employees, payroll, and attendance",
      icon: <Users className="w-8 h-8" />,
      href: "/hr",
      color: "from-green-500 to-emerald-600",
      stat: { label: "Total Employees", value: metrics.totalEmployees },
    },
    {
      title: "Payroll Management",
      description: "Process payroll, benefits, and deductions",
      icon: <DollarSign className="w-8 h-8" />,
      href: "/payroll",
      color: "from-amber-500 to-orange-600",
      stat: { label: "Pending", value: "0" },
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
      icon: <Settings className="w-8 h-8" />,
      href: "/settings",
      color: "from-purple-500 to-purple-600",
      stat: { label: "Active", value: "Yes" },
    },
    {
      title: "Analytics",
      description: "View system analytics and reports",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/reports",
      color: "from-pink-500 to-rose-600",
      stat: { label: "Reports", value: "15+" },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Super Admin Dashboard
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome back, {user?.name}. Manage your entire system from here.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/projects/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/projects")}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Manage Projects
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate("/employees/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => navigate("/payroll/create")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(metrics.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(metrics.activeProjects || 0)}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(metrics.totalEmployees || 0)}</div>
            <p className="text-xs text-muted-foreground">Total staff</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(metrics.pendingTasks || 0)}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{String(metrics.systemHealth || "OK")}</div>
            <p className="text-xs text-muted-foreground">All operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Card
            key={feature.href}
            className="cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50"
            onClick={() => navigate(feature.href)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="mt-4">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button variant="ghost" className="w-full group-hover:bg-accent">
                  Manage {feature.title.split(" ")[0]}
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">
                  {String(feature.stat.value || "0")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Alerts */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">System Status</h3>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle className="text-sm">All Systems Operational</CardTitle>
                <CardDescription>No critical issues detected. Database and services running smoothly.</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
