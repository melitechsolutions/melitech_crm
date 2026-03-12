import React, { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Demo Dashboard
 * Showcases all features and modules available in the Melitech CRM
 * Designed for marketing, testing, and onboarding new users
 */
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Demo data
  const demoStats = {
    activeUsers: 1254,
    activeProjects: 28,
    totalRevenue: 2540000,
    pendingInvoices: 12,
  };

  const demoInvoices = [
    {
      id: "1",
      number: "INV-000001",
      client: "Tech Solutions Ltd",
      amount: 125000,
      status: "sent",
      date: "2026-03-01",
    },
    {
      id: "2",
      number: "INV-000002",
      client: "Digital Agency Inc",
      amount: 89500,
      status: "pending",
      date: "2026-03-02",
    },
    {
      id: "3",
      number: "INV-000003",
      client: "Enterprise Corp",
      amount: 250000,
      status: "draft",
      date: "2026-03-03",
    },
  ];

  const demoProjects = [
    { id: "1", name: "Website Redesign", client: "Tech Solutions", status: "active", progress: 75 },
    { id: "2", name: "Mobile App Dev", client: "Digital Agency", status: "active", progress: 45 },
    { id: "3", name: "Cloud Migration", client: "Enterprise Corp", status: "on-hold", progress: 30 },
  ];

  const features = [
    {
      id: "invoices",
      title: "Invoicing",
      icon: <FileText className="w-6 h-6" />,
      description: "Create, track, and manage invoices",
      capabilities: ["Auto-numbering", "Payment tracking", "Bulk operations", "PDF export"],
    },
    {
      id: "accounting",
      title: "Accounting",
      icon: <DollarSign className="w-6 h-6" />,
      description: "Financial management and reporting",
      capabilities: ["Chart of Accounts", "Bank reconciliation", "Expense tracking", "Financial reports"],
    },
    {
      id: "projects",
      title: "Projects",
      icon: <BarChart3 className="w-6 h-6" />,
      description: "Project and team management",
      capabilities: ["Project tracking", "Team assignments", "Milestone management", "Budget control"],
    },
    {
      id: "hr",
      title: "Human Resources",
      icon: <Users className="w-6 h-6" />,
      description: "Employee and payroll management",
      capabilities: ["Employee records", "Payroll processing", "Leave management", "Attendance tracking"],
    },
    {
      id: "procurement",
      title: "Procurement",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Supply chain management",
      capabilities: ["LPO management", "Supplier tracking", "Purchase orders", "Inventory"],
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      description: "Business insights and analytics",
      capabilities: ["Financial reports", "Project analytics", "Performance metrics", "Data export"],
    },
  ];

  const demoUsers = [
    { role: "Admin", email: "admin@demo.melitech", permissions: "Full system access" },
    { role: "Accountant", email: "accountant@demo.melitech", permissions: "Accounting & reports" },
    { role: "HR Manager", email: "hr@demo.melitech", permissions: "HR & payroll" },
    { role: "Project Manager", email: "pm@demo.melitech", permissions: "Projects & teams" },
    { role: "Staff", email: "staff@demo.melitech", permissions: "Limited access" },
    { role: "Client", email: "client@demo.melitech", permissions: "Client portal" },
  ];

  const handleDemoAction = (action: string) => {
    toast.success(`Demo: ${action} executed`);
  };

  return (
    <DashboardLayout isDemoMode={true}>
      <ModuleLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Demo", href: "/demo" },
        ]}
        title="Melitech CRM Demo"
        description="Interactive demonstration of all features and modules"
        icon={<BarChart3 className="w-6 h-6" />}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
            <TabsTrigger value="accounts">Demo Accounts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Across all roles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ksh {(demoStats.totalRevenue / 1000).toFixed(0)}K</div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.pendingInvoices}</div>
                  <p className="text-xs text-muted-foreground">Awaiting action</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">{invoice.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Ksh {invoice.amount.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">View All Invoices</Button>
                </CardContent>
              </Card>

              {/* Active Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Current project status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoProjects.map((project) => (
                      <div key={project.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{project.name}</p>
                          <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.client}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right mt-1">{project.progress}%</p>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">View All Projects</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.capabilities.map((cap, idx) => (
                        <li key={feature || `demo-${idx}`} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Interactive Demo Tab */}
          <TabsContent value="interactive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Invoice Demo</CardTitle>
                <CardDescription>Try creating an invoice with auto-generated numbering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <Input value="INV-000004" disabled />
                  </div>
                  <div>
                    <Label>Client</Label>
                    <Input placeholder="Select client..." />
                  </div>
                  <div>
                    <Label>Amount (KES)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <Button
                  onClick={() => handleDemoAction("Invoice created")}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CRUD Operations Demo</CardTitle>
                <CardDescription>Interactive example of Create, Read, Update, Delete operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { icon: <Plus className="w-4 h-4" />, label: "Create new record", action: "Create" },
                    { icon: <Eye className="w-4 h-4" />, label: "View records", action: "View" },
                    { icon: <Edit2 className="w-4 h-4" />, label: "Edit record", action: "Edit" },
                    { icon: <Trash2 className="w-4 h-4" />, label: "Delete record", action: "Delete" },
                  ].map((item) => (
                    <Button
                      key={item.action}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDemoAction(`${item.action} action executed`)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demo Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demo User Accounts</CardTitle>
                <CardDescription>
                  Use these accounts to test different features and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoUsers.map((user, idx) => (
                    <Card key={user.email || `user-${idx}`} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{user.role}</h4>
                          <Badge>{user.permissions}</Badge>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Email: {user.email}</p>
                          <p className="text-muted-foreground">Password: <code>Demo@123</code></p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(user.email);
                            toast.success("Email copied to clipboard");
                          }}
                        >
                          Copy Email
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Access by Role</CardTitle>
                <CardDescription>Which features each role can access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p><strong>Admin:</strong> Full access to all modules and features</p>
                  <p><strong>Accountant:</strong> Accounting, invoices, payments, reports, and bank reconciliation</p>
                  <p><strong>HR Manager:</strong> Employee records, payroll, leave, attendance</p>
                  <p><strong>Project Manager:</strong> Projects, teams, clients, budgets, and reports</p>
                  <p><strong>Staff:</strong> Projects, attendance, leave requests, limited reports</p>
                  <p><strong>Client:</strong> Client portal - view projects, invoices, and documents</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ModuleLayout>
    </DashboardLayout>
  );
}
