import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  Users,
  FolderKanban,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Clock,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: statsData, isLoading: isStatsLoading } = trpc.dashboard.stats.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });
  const { data: metricsData, isLoading: isMetricsLoading } = trpc.dashboard.metrics.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });
  const { data: recentProjects = [], isLoading: isProjectsLoading } = trpc.projects.list.useQuery({ limit: 3 }, {
    retry: 1,
    staleTime: 30000,
  });
  const { data: recentActivity = [], isLoading: isActivityLoading } = trpc.dashboard.recentActivity.useQuery({ limit: 4 }, {
    retry: 1,
    staleTime: 30000,
  });

  // Convert frozen objects to plain objects
  const statsDataPlain = statsData ? JSON.parse(JSON.stringify(statsData)) : null;
  const metricsDataPlain = metricsData ? JSON.parse(JSON.stringify(metricsData)) : null;
  const recentProjectsPlain = recentProjects ? JSON.parse(JSON.stringify(recentProjects)) : [];
  const recentActivityPlain = recentActivity ? JSON.parse(JSON.stringify(recentActivity)) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount / 100);
  };

  const stats = useMemo(() => [
    {
      title: "Total Revenue",
      value: statsDataPlain ? formatCurrency(statsDataPlain.totalRevenue || 0) : "Ksh 0",
      change: statsDataPlain?.revenueGrowth ? `${statsDataPlain.revenueGrowth > 0 ? "+" : ""}${statsDataPlain.revenueGrowth}%` : "0%",
      trend: (statsDataPlain?.revenueGrowth || 0) >= 0 ? "up" : "down",
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Active Projects",
      value: statsDataPlain?.activeProjects?.toString() || "0",
      change: statsDataPlain?.newProjects ? `+${statsDataPlain.newProjects}` : "0",
      trend: "up" as const,
      icon: FolderKanban,
      description: "In progress",
    },
    {
      title: "Total Clients",
      value: statsDataPlain?.totalClients?.toString() || "0",
      change: statsDataPlain?.newClients ? `+${statsDataPlain.newClients}` : "0",
      trend: "up" as const,
      icon: Users,
      description: "Active clients",
    },
    {
      title: "Pending Invoices",
      value: metricsDataPlain?.pendingInvoices?.toString() || "0",
      change: "0",
      trend: "neutral" as const,
      icon: FileText,
      description: "Awaiting payment",
    },
  ], [statsDataPlain, metricsDataPlain]);

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "project": return FolderKanban;
      case "client": return Users;
      case "invoice": return FileText;
      case "payment": return DollarSign;
      default: return Clock;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
          <Button onClick={() => navigate("/projects/create")}>
            <FolderKanban className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`flex items-center ${
                      stat.trend === "up" ? "text-green-500" :
                      stat.trend === "down" ? "text-red-500" :
                      ""
                    }`}>
                      {stat.trend === "up" && <TrendingUp className="mr-1 h-3 w-3" />}
                      {stat.trend === "down" && <TrendingDown className="mr-1 h-3 w-3" />}
                      {stat.change}
                    </span>
                    <span>{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your active and upcoming projects</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjectsPlain.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No projects found</p>
                ) : (
                  recentProjectsPlain.map((project: any) => (
                    <div key={project.id} className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors" onClick={() => navigate(`/projects/${project.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.projectNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "No date"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivityPlain.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  recentActivityPlain.map((activity: any, index: number) => {
                    const Icon = getActivityIcon(activity.entityType || "");
                    return (
                      <div key={activity.id || index} className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{(activity.action || '').replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{(activity.description || '')}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : "recently"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/clients/create")}>
                <Users className="h-6 w-6" />
                <span className="text-xs text-center">Add Client</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/projects/create")}>
                <FolderKanban className="h-6 w-6" />
                <span className="text-xs text-center">New Project</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/invoices/create")}>
                <FileText className="h-6 w-6" />
                <span className="text-xs text-center">Create Invoice</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/estimates/create")}>
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-xs text-center">New Estimate</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/receipts/create")}>
                <Receipt className="h-6 w-6" />
                <span className="text-xs text-center">New Receipt</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/suppliers")}>
                <FileText className="h-6 w-6" />
                <span className="text-xs text-center">Suppliers</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Module Navigation Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Modules & Features</CardTitle>
            <CardDescription>Access key system modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/suppliers")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Procurement</h3>
                    <p className="text-xs text-muted-foreground">Manage suppliers</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/inventory")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Inventory</h3>
                    <p className="text-xs text-muted-foreground">Stocks & inventory</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/projects")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Projects</h3>
                    <p className="text-xs text-muted-foreground">Project management</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/invoices")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Billing</h3>
                    <p className="text-xs text-muted-foreground">Invoices & receipts</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/employees")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 text-pink-600 rounded">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">HR</h3>
                    <p className="text-xs text-muted-foreground">Employees & payroll</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/accounts")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Finance</h3>
                    <p className="text-xs text-muted-foreground">Accounts & reports</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/reports")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Reports</h3>
                    <p className="text-xs text-muted-foreground">Analytics & insights</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                onClick={() => navigate("/settings")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Settings</h3>
                    <p className="text-xs text-muted-foreground">System configuration</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
