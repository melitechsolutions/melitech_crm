import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";

/**
 * HR Module Hub
 * 
 * Central gateway for all HR functionalities including:
 * - Employee Management
 * - Attendance Tracking
 * - Payroll Management
 * - Leave Management
 * - Department Management
 * - HR Analytics & Reports
 */
export default function HR() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });
  const { allowed, isLoading: permissionLoading } = useRequireFeature("hr:view");

  // Fetch HR metrics from backend
  const { data: employeesData = [], isLoading: employeesLoading } = trpc.employees.list.useQuery();
  const { data: attendanceData = [], isLoading: attendanceLoading } = trpc.attendance.list.useQuery();
  const { data: payrollData = [], isLoading: payrollLoading } = trpc.payroll.list.useQuery();
  const { data: leaveData = [], isLoading: leaveLoading } = trpc.leaveManagement.list.useQuery();
  const { data: departmentsData = [], isLoading: departmentsLoading } = trpc.departments.list.useQuery();
  const { data: jobGroupsData = [], isLoading: jobGroupsLoading } = trpc.jobGroups.list.useQuery();

  if (loading || permissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  // Calculate metrics from real data
  const totalEmployees = employeesData?.length || 0;
  const activeEmployees = employeesData?.filter((e: any) => e.isActive)?.length || 0;
  const pendingLeaveRequests = leaveData?.filter((l: any) => l.status === 'pending')?.length || 0;
  const totalDepartments = departmentsData?.length || 0;
  const absentToday = attendanceData?.filter((a: any) => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today && a.status === 'absent';
  })?.length || 0;

  // Module cards data
  const modules = [
    {
      title: "Employees",
      description: "Manage employee records, profiles, and information",
      icon: Users,
      href: "/employees",
      color: "from-blue-500 to-blue-600",
      stats: `${activeEmployees} Active`,
      action: "Manage Employees",
    },
    {
      title: "Departments",
      description: "Organize and manage department structure",
      icon: Building2,
      href: "/departments",
      color: "from-purple-500 to-purple-600",
      stats: `${totalDepartments} Departments`,
      action: "View Departments",
    },
    {
      title: "Attendance",
      description: "Track employee attendance and working hours",
      icon: Calendar,
      href: "/attendance",
      color: "from-green-500 to-green-600",
      stats: `${absentToday} Absent Today`,
      action: "Check Attendance",
    },
    {
      title: "Leave Management",
      description: "Handle leave requests, approvals, and tracking",
      icon: Clock,
      href: "/leave-management",
      color: "from-orange-500 to-orange-600",
      stats: `${pendingLeaveRequests} Pending`,
      action: "Manage Leave",
    },
    {
      title: "Payroll",
      description: "Process salaries, allowances, and deductions",
      icon: DollarSign,
      href: "/payroll",
      color: "from-pink-500 to-pink-600",
      stats: `${payrollData?.length || 0} Records`,
      action: "View Payroll",
    },
    {
      title: "Performance",
      description: "Track and manage employee performance reviews",
      icon: TrendingUp,
      href: "/hr-performance",
      color: "from-indigo-500 to-indigo-600",
      stats: "Coming Soon",
      action: "Performance Reviews",
    },
    {
      title: "Job Groups",
      description: "Manage job grades, salary structures, and classifications",
      icon: Building2,
      href: "/job-groups",
      color: "from-cyan-500 to-cyan-600",
      stats: `${jobGroupsData?.length || 0} Groups`,
      action: "Manage Job Groups",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isLoading = employeesLoading || attendanceLoading || payrollLoading || leaveLoading || departmentsLoading;

  return (
    <ModuleLayout
      title="Human Resources"
      description="Manage employees, departments, attendance, leave, payroll, and more"
      icon={<Users className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">{activeEmployees} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Organizational units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absentToday}</div>
              <p className="text-xs text-muted-foreground">Employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaveRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll Records</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrollData?.length || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.href}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(module.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {module.description}
                      </CardDescription>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${module.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {module.stats}
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(module.href);
                    }}
                  >
                    {module.action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/employees/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Employee
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/departments/create")}>
                <Building2 className="h-4 w-4 mr-2" />
                Create Department
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/attendance/create")}>
                <Calendar className="h-4 w-4 mr-2" />
                Record Attendance
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/leave-management/create")}>
                <Clock className="h-4 w-4 mr-2" />
                Process Leave Request
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/payroll/create")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/job-groups")}>
                <Building2 className="h-4 w-4 mr-2" />
                Manage Job Groups
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <TrendingUp className="h-4 w-4 mr-2" />
                View HR Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}

