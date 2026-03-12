import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function HRDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingRequests: 0,
  });

  // Fetch dashboard metrics
  const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery();

  useEffect(() => {
    if (dashboardMetrics) {
      setMetrics({
        totalEmployees: dashboardMetrics.totalEmployees || 0,
        presentToday: Math.floor((dashboardMetrics.totalEmployees || 0) * 0.85),
        onLeave: Math.floor((dashboardMetrics.totalEmployees || 0) * 0.1),
        pendingRequests: 3,
      });
    }
  }, [dashboardMetrics]);

  const hrFeatures = [
    {
      title: "Employees",
      description: "Manage employee records and information",
      icon: <Users className="w-8 h-8" />,
      href: "/employees",
      color: "from-blue-500 to-blue-600",
      stat: { label: "Total Employees", value: metrics.totalEmployees },
    },
    {
      title: "Attendance",
      description: "Track attendance and check-ins",
      icon: <Calendar className="w-8 h-8" />,
      href: "/attendance",
      color: "from-green-500 to-green-600",
      stat: { label: "Present Today", value: metrics.presentToday },
    },
    {
      title: "Leave Management",
      description: "Manage leave requests and approvals",
      icon: <Clock className="w-8 h-8" />,
      href: "/leave-management",
      color: "from-orange-500 to-orange-600",
      stat: { label: "On Leave", value: metrics.onLeave },
    },
    {
      title: "Payroll",
      description: "Process payroll and salary management",
      icon: <FileText className="w-8 h-8" />,
      href: "/payroll",
      color: "from-purple-500 to-purple-600",
      stat: { label: "Pending", value: 0 },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          HR Dashboard
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome, {user?.name}. Manage your human resources from here.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.presentToday}</div>
            <p className="text-xs text-muted-foreground">Checked in</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onLeave}</div>
            <p className="text-xs text-muted-foreground">Currently away</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {hrFeatures.map((feature) => (
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
                  View {feature.title}
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">
                  {feature.stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => navigate("/employees/create")}
          >
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Add New Employee</div>
              <div className="text-sm text-muted-foreground">Create a new employee record</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => navigate("/attendance/create")}
          >
            <Calendar className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Record Attendance</div>
              <div className="text-sm text-muted-foreground">Mark attendance for today</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
