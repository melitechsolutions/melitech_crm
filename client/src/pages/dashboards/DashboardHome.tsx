import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistantModal } from "@/components/AIAssistantModal";

/**
 * DashboardHome - Unified Role-Based Dashboard
 * 
 * This is the main dashboard for all users in the CRM system.
 * Content is filtered based on user role:
 * - super_admin & admin: See all features
 * - accountant: See accounting/payments features
 * - hr: See HR/employee features
 * - All others: See general business features
 * 
 * Routes accessing this component:
 * - /crm (primary unified dashboard)
 * - /dashboards/dashboardhome (direct dashboard path)
 * - /dashboard-home (legacy compatibility)
 */
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  CreditCard,
  BarChart3,
  UserCog,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: string | number;
  };
  roles?: string[]; // Optional: if not specified, visible to all users
}

export default function DashboardHome() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Comprehensive tRPC queries for all dashboard sections
  const { 
    data: dashboardMetrics, 
    isLoading: metricsLoading 
  } = trpc.dashboard.metrics.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: dashboardStats, 
    isLoading: statsLoading 
  } = trpc.dashboard.stats.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: recentActivityData, 
    isLoading: activityLoading 
  } = trpc.dashboard.recentActivity.useQuery({ limit: 5 }, {
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: accountingMetrics, 
    isLoading: accountingLoading 
  } = trpc.dashboard.accountingMetrics.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  // Combined loading state
  const isLoading = metricsLoading || statsLoading || activityLoading || accountingLoading;

  // Normalize metrics with type safety
  const metrics = {
    totalProjects: Number(dashboardMetrics?.totalProjects) || 0,
    activeClients: Number(dashboardMetrics?.activeClients) || 0,
    pendingInvoices: Number(dashboardMetrics?.pendingInvoices) || 0,
    monthlyRevenue: Number(dashboardMetrics?.monthlyRevenue) || 0,
    totalProducts: Number(dashboardMetrics?.totalProducts) || 0,
    totalServices: Number(dashboardMetrics?.totalServices) || 0,
    totalEmployees: Number(dashboardMetrics?.totalEmployees) || 0,
  };

  const stats = {
    totalRevenue: Number(dashboardStats?.totalRevenue) || 0,
    revenueGrowth: Number(dashboardStats?.revenueGrowth) || 0,
    activeProjects: Number(dashboardStats?.activeProjects) || 0,
    newProjects: Number(dashboardStats?.newProjects) || 0,
    totalClients: Number(dashboardStats?.totalClients) || 0,
    newClients: Number(dashboardStats?.newClients) || 0,
  };

  // Enhanced sample data for charts
  const monthlyRevenueData = [
    { month: "Jan", revenue: metrics.monthlyRevenue * 0.6, target: 500000 },
    { month: "Feb", revenue: metrics.monthlyRevenue * 0.75, target: 500000 },
    { month: "Mar", revenue: metrics.monthlyRevenue * 0.9, target: 500000 },
    { month: "Apr", revenue: metrics.monthlyRevenue * 1.1, target: 500000 },
    { month: "May", revenue: metrics.monthlyRevenue, target: 500000 },
    { month: "Jun", revenue: metrics.monthlyRevenue * 0.95, target: 500000 },
  ];

  const clientStatusData = [
    { name: "Active", value: metrics.activeClients, color: "#10b981" },
    { name: "Inactive", value: Math.max(0, metrics.activeClients - 5), color: "#6b7280" },
  ];

  const invoiceStatusData = [
    { month: "Jan", paid: 15, pending: 8, overdue: 2 },
    { month: "Feb", paid: 18, pending: 5, overdue: 1 },
    { month: "Mar", paid: 22, pending: 3, overdue: 0 },
    { month: "Apr", paid: 25, pending: 4, overdue: 1 },
    { month: "May", paid: 28, pending: 6, overdue: 2 },
    { month: "Jun", paid: 20, pending: metrics.pendingInvoices, overdue: 1 },
  ];

  const handleCardClick = (href: string, actionId?: string) => {
    if (actionId === "ai-assistant") {
      setAiAssistantOpen(true);
      return;
    }
    if (href && href !== "#") {
      navigate(href);
    }
  };

  // Define quick actions with dynamic metrics
  const quickActions: QuickActionCard[] = [
    {
      id: "ai-assistant",
      title: "AI Assistant",
      description: "Get instant help and insights",
      icon: <span className="text-lg">✨</span>,
      href: "#", // Don't navigate, this opens the modal
      color: "from-violet-500 to-violet-600",
      stats: { label: "Smart", value: "24/7" },
    },
    {
      id: "projects",
      title: "Projects",
      description: "Manage and track all your projects",
      icon: <FolderKanban className="w-8 h-8" />,
      href: "/projects",
      color: "from-blue-500 to-blue-600",
      stats: { label: "Total Projects", value: metrics.totalProjects },
    },
    {
      id: "clients",
      title: "Clients",
      description: "Client relationship management",
      icon: <Users className="w-8 h-8" />,
      href: "/clients",
      color: "from-green-500 to-green-600",
      stats: { label: "Active Clients", value: metrics.activeClients },
    },
    {
      id: "invoices",
      title: "Invoices",
      description: "Create and manage invoices",
      icon: <FileText className="w-8 h-8" />,
      href: "/invoices",
      color: "from-purple-500 to-purple-600",
      stats: { label: "Pending Invoices", value: metrics.pendingInvoices },
    },
    {
      id: "estimates",
      title: "Estimates",
      description: "Generate quotations and estimates",
      icon: <Receipt className="w-8 h-8" />,
      href: "/estimates",
      color: "from-orange-500 to-orange-600",
      stats: { label: "Pending Estimates", value: 0 },
    },
    {
      id: "payments",
      title: "Payments",
      description: "Track payments and transactions",
      icon: <DollarSign className="w-8 h-8" />,
      href: "/payments",
      color: "from-green-500 to-emerald-600",
      stats: { label: "This Month", value: `KES ${metrics.monthlyRevenue.toLocaleString()}` },
      roles: ["super_admin", "admin", "accountant"] // Primary access for accountants
    },
    {
      id: "products",
      title: "Products",
      description: "Product catalog management",
      icon: <Package className="w-8 h-8" />,
      href: "/products",
      color: "from-cyan-500 to-cyan-600",
      stats: { label: "Total Products", value: metrics.totalProducts },
    },
    {
      id: "services",
      title: "Services",
      description: "Service offerings catalog",
      icon: <Briefcase className="w-8 h-8" />,
      href: "/services",
      color: "from-indigo-500 to-indigo-600",
      stats: { label: "Total Services", value: metrics.totalServices },
    },
    {
      id: "accounting",
      title: "Accounting",
      description: "Financial management and reports",
      icon: <CreditCard className="w-8 h-8" />,
      href: "/accounting",
      color: "from-pink-500 to-pink-600",
      stats: { label: "Accounts", value: accountingMetrics?.totalInvoices || 0 },
      roles: ["super_admin", "admin", "accountant"] // For accounting team
    },
    {
      id: "reports",
      title: "Reports",
      description: "Analytics and insights",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/reports",
      color: "from-amber-500 to-amber-600",
      stats: { label: "Reports", value: 0 },
    },
    {
      id: "hr",
      title: "HR",
      description: "Human resources management",
      icon: <UserCog className="w-8 h-8" />,
      href: "/hr",
      color: "from-red-500 to-red-600",
      stats: { label: "Employees", value: metrics.totalEmployees },
      roles: ["super_admin", "admin", "hr"] // Primary access for HR
    },
  ];

  // Filter quick actions based on user role
  const filteredQuickActions = quickActions.filter(action => {
    // Show to super_admin and admin always
    if (user?.role === "super_admin" || user?.role === "admin") return true;
    // If action has no role restriction, show to everyone
    if (!action.roles) return true;
    // Otherwise, only show if user role matches
    return action.roles.includes(user?.role || "");
  });

  const overviewMetrics = [
    {
      title: "Total Projects",
      value: metrics.totalProjects.toString(),
      description: "Get started by creating your first project",
      icon: <FolderKanban className="w-5 h-5" />,
      color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
      href: "/projects",
    },
    {
      title: "Active Clients",
      value: metrics.activeClients.toString(),
      description: "Add your first client",
      icon: <Users className="w-5 h-5" />,
      color: "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400",
      href: "/clients",
    },
    {
      title: "Pending Invoices",
      value: metrics.pendingInvoices.toString(),
      description: "No pending invoices",
      icon: <FileText className="w-5 h-5" />,
      color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-l-purple-400",
      href: "/invoices",
    },
    {
      title: "Revenue",
      value: `KES ${metrics.monthlyRevenue.toLocaleString()}`,
      description: "This month",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400",
      href: "/accounting",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 pb-8">
        {/* Enhanced Hero Welcome Section with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 md:p-10 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative space-y-3 sm:space-y-4 text-white">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium">Dashboard Live</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {user?.name ? user.name.split(" ")[0] : "User"}
              </span>!
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Here's your business dashboard. Track your performance, manage operations, and grow your business with real-time insights.
            </p>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
              {[
                { label: "Revenue Growth", value: `${stats.revenueGrowth}%`, icon: <TrendingUp className="w-4 h-4" /> },
                { label: "New Clients", value: stats.newClients, icon: <Users className="w-4 h-4" /> },
                { label: "Active Projects", value: stats.activeProjects, icon: <FolderKanban className="w-4 h-4" /> },
                { label: "Total Revenue", value: `KES ${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-4 h-4" /> },
              ].map((metric, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-300">{metric.icon}</span>
                    <span className="text-xs sm:text-sm text-slate-300 font-medium">{metric.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Quick Actions - Changed to 5 items horizontal scroll on mobile */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Quick Access</h2>
            {isLoading && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-400" />}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {filteredQuickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleCardClick(action.href, action.id)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-xl border transition-all duration-300 bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-5 text-left hover:shadow-xl hover:-translate-y-1.5 dark:hover:border-slate-600 hover:border-slate-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                {/* Background gradient on hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-15 duration-300",
                    `bg-gradient-to-br ${action.color}`
                  )}
                />

                {/* Content */}
                <div className="relative space-y-2.5 sm:space-y-3">
                  {/* Icon with enhanced gradient background */}
                  <div
                    className={cn(
                      "inline-flex p-2.5 sm:p-3 rounded-lg text-white shadow-lg",
                      `bg-gradient-to-br ${action.color}`
                    )}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">{action.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-xs sm:text-sm md:text-base leading-tight">
                    {action.title}
                  </h3>

                  {/* Stats if available */}
                  {action.stats && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 hidden sm:block">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                        {action.stats.label}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {typeof action.stats.value === "number" ? action.stats.value.toString() : action.stats.value}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors duration-300 opacity-0 group-hover:opacity-100">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Animated bottom border */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Summary Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {overviewMetrics.map((metric) => (
              <button
                key={metric.title}
                onClick={() => handleCardClick(metric.href)}
                disabled={isLoading}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 md:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                  "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700",
                  "hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xl",
                  metric.color
                )}
              >
                {/* Gradient overlay on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                />

                <div className="relative flex items-start justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {metric.title}
                    </p>
                    {isLoading ? (
                      <div className="h-8 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-24"></div>
                    ) : (
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {metric.value}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1.5">
                      {metric.description}
                    </p>
                  </div>
                  <div className="ml-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors duration-300 flex-shrink-0 animate-fade-in-out">
                    {metric.icon}
                  </div>
                </div>

                {/* Animated bottom border indicator */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-full transition-all duration-500"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Analytics & Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Monthly Revenue Chart */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-base sm:text-lg">Revenue Trend</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Last 6 months performance</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {isLoading ? (
                  <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="month" stroke="currentColor" opacity={0.5} />
                      <YAxis stroke="currentColor" opacity={0.5} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Actual"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#9ca3af" 
                        strokeDasharray="5 5"
                        dot={false}
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Invoice Status Chart */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-base sm:text-lg">Invoice Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Payment tracking overview</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {isLoading ? (
                  <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={invoiceStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="month" stroke="currentColor" opacity={0.5} />
                      <YAxis stroke="currentColor" opacity={0.5} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Client Distribution Chart */}
            <Card className="col-span-1 overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-green-50 to-green-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-base sm:text-lg">Client Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Active vs Inactive</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {isLoading ? (
                  <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={clientStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {clientStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Section with Real Data */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Recent Activity</h2>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              View All
            </Button>
          </div>
          <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-purple-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-800/50">
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-50">Latest Updates</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Recent changes and activities in your CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : recentActivityData && recentActivityData.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivityData.slice(0, 5).map((activity, idx) => (
                    <div key={`${activity.id}-${idx}`} className="flex items-start space-x-3 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 -mx-2 rounded-lg transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          activity.action === "created" ? "bg-green-500" :
                          activity.action === "updated" ? "bg-blue-500" :
                          activity.action === "deleted" ? "bg-red-500" :
                          "bg-slate-400"
                        )}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-50 capitalize">
                          {activity.action} {activity.entityType}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {activity.description || `ID: ${activity.entityId}`}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No recent activity
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Start by creating your first project or client
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Getting Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Add Your First Client</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Start building your client database by adding new clients to your CRM system.
                </p>
                <Button
                  onClick={() => handleCardClick("/clients")}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-blue-600 hover:bg-blue-700 group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add Client
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-purple-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-purple-600" />
                  <span>Create Your First Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Organize your work by creating projects and assigning tasks to your team members.
                </p>
                <Button
                  onClick={() => handleCardClick("/projects/create")}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-purple-600 hover:bg-purple-700 group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-green-50 to-green-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Generate Your First Invoice</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Create professional invoices and track payments from your clients efficiently.
                </p>
                <Button
                  onClick={() => handleCardClick("/invoices")}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-green-600 hover:bg-green-700 group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  New Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        context="Dashboard"
      />
    </DashboardLayout>
  );
}

