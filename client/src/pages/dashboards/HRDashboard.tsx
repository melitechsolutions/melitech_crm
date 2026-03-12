import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Loader2,
  FolderKanban,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  CreditCard,
  BarChart3,
  UserCog,
  ArrowRight,
  Mail,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import TeamWorkloadDashboard from "@/components/TeamWorkloadDashboard";

/**
 * HRDashboard component
 * 
 * Features:
 * - Employee management
 * - Attendance tracking
 * - Leave management
 * - Payroll overview
 * - Performance reviews
 * - Recruitment
 */
export default function HRDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });
  const [, setLocation] = useLocation();

  // Fetch employees data from backend
  const { data: employeesData, isLoading: employeesLoading } = trpc.employees.list.useQuery();
  
  // Fetch attendance data from backend
  const { data: attendanceData, isLoading: attendanceLoading } = trpc.attendance.list.useQuery();
  
  // Fetch leave requests from backend
  const { data: leaveData, isLoading: leaveLoading } = trpc.leave.list.useQuery();
  
  // Fetch payroll data from backend
  const { data: payrollData, isLoading: payrollLoading } = trpc.payroll.list.useQuery();

  // Convert frozen Drizzle objects to plain objects to avoid React error #306
  const employeesDataPlain = employeesData ? JSON.parse(JSON.stringify(employeesData)) : [];
  const attendanceDataPlain = attendanceData ? JSON.parse(JSON.stringify(attendanceData)) : [];
  const leaveDataPlain = leaveData ? JSON.parse(JSON.stringify(leaveData)) : [];
  const payrollDataPlain = payrollData ? JSON.parse(JSON.stringify(payrollData)) : [];

  useEffect(() => {
    // Verify user has hr role
    if (!loading && isAuthenticated && user?.role !== "hr") {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading || employeesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "hr") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  // Calculate employee statistics
  const totalEmployees = employeesDataPlain?.length || 0;
  const activeEmployees = employeesDataPlain?.filter((e: any) => e.status === "active").length || 0;
  
  // Calculate today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceDataPlain?.filter((a: any) => 
    a.date && new Date(a.date).toISOString().split('T')[0] === today
  ) || [];
  
  const presentToday = todayAttendance.filter((a: any) => a.status === "present" || a.status === "late").length;
  const absentToday = todayAttendance.filter((a: any) => a.status === "absent").length;
  const lateToday = todayAttendance.filter((a: any) => a.status === "late").length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  
  // Calculate leave statistics
  const approvedLeaves = leaveDataPlain?.filter((l: any) => l.status === "approved").length || 0;
  const pendingLeaves = leaveDataPlain?.filter((l: any) => l.status === "pending").length || 0;
  const recentLeaveRequests = leaveDataPlain?.filter((l: any) => l.status === "pending").slice(0, 5) || [];

  // Module features for navigation
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
      title: "Accounting",
      description: "Financial management and reports",
      icon: CreditCard,
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
      title: "HR Analytics",
      description: "Employee metrics and trends",
      icon: TrendingUp,
      href: "/hr/analytics",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      title: "HR",
      description: "Human resources management",
      icon: UserCog,
      href: "/hr",
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-950",
    },
    {
      title: "Communications",
      description: "Email, SMS, and messaging",
      icon: Mail,
      href: "/communications",
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
  ];

  return (
    <DashboardLayout
      title="HR Dashboard"
      user={user}
      onLogout={handleLogout}
    >
      <div className="space-y-8">
        {/* HR Welcome Section */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Human Resources Dashboard</h1>
          <p className="text-lg opacity-90 mb-4">
            Manage employees, attendance, leave requests, and payroll operations.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => setLocation("/hr/management")}
              className="gap-2 bg-white hover:bg-slate-100 text-rose-700"
            >
              <Settings className="w-4 h-4" />
              HR Management
            </Button>
            <Button 
              className="bg-white text-slate-900 hover:bg-gray-100"
              onClick={() => setLocation("/crm")}
            >
              Go to Main Dashboard
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalEmployees}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeEmployees} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentToday}/<span className="text-sm text-slate-600 dark:text-slate-300">{totalEmployees}</span></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{attendanceRate}% attendance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{leaveDataPlain?.filter((l: any) => l.status === "pending").length || 0}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Payroll Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{payrollDataPlain?.length || 0}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total cycles</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-accent">
                    View {feature.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="workload" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Team Workload
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Employee Management</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Manage employee information and records</CardDescription>
                  </div>
                  <Button onClick={() => setLocation("/employees/new")}>Add Employee</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Search employees..." />
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-900/40 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Position</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Department</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(employeesData) && employeesData.length > 0 ? (
                          employeesData.slice(0, 10).map((employee: any) => (
                            <tr key={employee.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/30">
                              <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{employee.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{employee.position || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{employee.department || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  employee.status === 'active' ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                }`}>
                                  {employee.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <Button variant="ghost" size="sm" onClick={() => setLocation(`/employees/${employee.id}`)}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                              No employees found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Attendance Tracking</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Monitor employee attendance records</CardDescription>
                  </div>
                  <Button onClick={() => setLocation("/attendance/new")}>Mark Attendance</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Present</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{presentToday}</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Absent</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{absentToday}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Late</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{lateToday}</p>
                    </div>
                  </div>
                  {todayAttendance.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p>No attendance records for today</p>
                      <Button className="mt-4" onClick={() => setLocation("/attendance/new")}>
                        Mark Attendance
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Management Tab */}
          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Leave Management</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Manage employee leave requests</CardDescription>
                  </div>
                  <Button onClick={() => setLocation("/leave/new")}>New Leave Request</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLeaveRequests.length > 0 ? (
                    recentLeaveRequests.map((leave: any) => (
                      <div key={leave.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-slate-50">
                              {leave.employeeName || 'Employee'} - {leave.type || 'Leave'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'} - {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setLocation(`/leave/${leave.id}`)}>
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-slate-500 dark:text-slate-400">No pending leave requests</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Payroll Management</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Manage employee payroll and salaries</CardDescription>
                  </div>
                  <Button onClick={() => setLocation("/payroll/new")}>Process Payroll</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(payrollData) && payrollData.length > 0 ? (
                    payrollData.slice(0, 5).map((payroll: any) => (
                      <div key={payroll.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-slate-50">
                              {payroll.month || 'Month'} {payroll.year || 'Year'} Payroll
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {payroll.status === 'processed' ? 'Processed' : 'Pending processing'}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setLocation(`/payroll/${payroll.id}`)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p>No payroll records found</p>
                      <Button className="mt-4" onClick={() => setLocation("/payroll/new")}>
                        Process Payroll
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Workload Tab */}
          <TabsContent value="workload" className="space-y-4">
            <TeamWorkloadDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
