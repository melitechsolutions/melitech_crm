import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Edit,
  UserCheck,
  Clock,
  Umbrella,
  Award,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function EmployeeDetails() {
  const [, params] = useRoute("/employees/:id");
  const [, navigate] = useLocation();
  const employeeId = params?.id || "";

  // Fetch employee from backend
  const { data: employeeData, isLoading } = trpc.employees.getById.useQuery(employeeId);
  const { data: jobGroupsData = [] } = trpc.jobGroups.list.useQuery();

  const jobGroup = jobGroupsData.find((jg: any) => jg.id === (employeeData as any)?.jobGroupId);

  const employee = employeeData ? {
    id: employeeId,
    employeeId: (employeeData as any).employeeNumber || `EMP-${employeeId.slice(0, 8)}`,
    name: `${(employeeData as any).firstName || ""} ${(employeeData as any).lastName || ""}`.trim() || "Unknown Employee",
    email: (employeeData as any).email || "",
    phone: (employeeData as any).phone || "",
    address: (employeeData as any).address || "",
    department: (employeeData as any).department || "Unknown",
    position: (employeeData as any).position || "Unknown",
    jobGroupId: (employeeData as any).jobGroupId || "",
    jobGroupName: jobGroup?.name || "Unknown",
    employmentType: (employeeData as any).employmentType || "full_time",
    status: (employeeData as any).status || "active",
    joinDate: (employeeData as any).hireDate ? new Date((employeeData as any).hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    salary: ((employeeData as any).salary || 0) / 100,
    photoUrl: (employeeData as any).photoUrl || "",
    avatar: null,
  } : null;

  const attendanceRecords = [
    { date: "2024-10-21", clockIn: "08:30 AM", clockOut: "05:45 PM", hours: 9.25, status: "present" },
    { date: "2024-10-20", clockIn: "08:45 AM", clockOut: "06:00 PM", hours: 9.25, status: "present" },
    { date: "2024-10-19", clockIn: "09:15 AM", clockOut: "05:30 PM", hours: 8.25, status: "late" },
  ];

  const leaveHistory = [
    { type: "Annual Leave", startDate: "2024-09-01", endDate: "2024-09-05", days: 5, status: "approved" },
    { type: "Sick Leave", startDate: "2024-07-15", endDate: "2024-07-16", days: 2, status: "approved" },
  ];

  const payrollHistory = [
    { month: "October 2024", basic: 150000, allowances: 20000, deductions: 15000, net: 155000 },
    { month: "September 2024", basic: 150000, allowances: 20000, deductions: 15000, net: 155000 },
    { month: "August 2024", basic: 150000, allowances: 20000, deductions: 15000, net: 155000 },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "on-leave":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-3 w-3" />;
      case "present":
        return <UserCheck className="h-3 w-3" />;
      case "late":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading employee...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Employee not found</p>
          <Button onClick={() => navigate("/employees")}>Back to Employees</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Photo */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-6 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/employees")} className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-32 w-32">
              <AvatarImage src={employee?.photoUrl || undefined} alt={employee?.name} />
              <AvatarFallback className="text-lg">
                {employee?.name.charAt(0)}{employee?.name.split(' ')[1]?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{employee?.name}</h1>
              <p className="text-muted-foreground text-lg">{employee?.position}</p>
              <p className="text-muted-foreground text-sm mt-1">{employee?.employeeId}</p>
              <div className="mt-3 flex gap-2">
                <Badge variant="default">{employee?.jobGroupName}</Badge>
                <Badge variant="secondary">{employee?.employmentType?.replace('_', ' ').toUpperCase()}</Badge>
                <Badge variant={employee?.status === "active" ? "default" : "secondary"}>
                  {employee?.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/employees/${employeeId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Employee
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Group</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.jobGroupName}</div>
              <p className="text-xs text-muted-foreground">{employee.employmentType?.replace('_', ' ')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.department}</div>
              <p className="text-xs text-muted-foreground">{employee.position}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(employee.salary || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Join Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(employee.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.floor((Date.now() - new Date(employee.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
              <Umbrella className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14 days</div>
              <p className="text-xs text-muted-foreground">Annual leave remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Employee contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{employee.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave History</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Last 30 days attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record, index) => (
                      <TableRow key={record.date ? `attendance-${record.date}` : `record-${index}`}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.clockIn}</TableCell>
                        <TableCell>{record.clockOut}</TableCell>
                        <TableCell>{record.hours} hrs</TableCell>
                        <TableCell>
                          <Badge variant={record.status === "present" ? "default" : "outline"}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave History</CardTitle>
                <CardDescription>Past leave requests and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveHistory.map((leave, index) => (
                      <TableRow key={leave.startDate ? `leave-${leave.startDate}` : `leave-${index}`}>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{leave.days} days</TableCell>
                        <TableCell>
                          <Badge variant="default">{leave.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>Monthly salary breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Basic Salary</TableHead>
                      <TableHead className="text-right">Allowances</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollHistory.map((payroll, index) => (
                      <TableRow key={payroll.month || `payroll-${index}`}>
                        <TableCell>{payroll.month}</TableCell>
                        <TableCell className="text-right">Ksh {(payroll.basic || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">
                          +Ksh {(payroll.allowances || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -Ksh {(payroll.deductions || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          Ksh {(payroll.net || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

