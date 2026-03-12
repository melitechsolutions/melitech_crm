import { useState, useMemo } from "react";
import { useRequireFeature } from "@/hooks/useRequireFeature";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import ActionButtons from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Download, DollarSign } from "lucide-react";
import { BulkExportManager } from "@/components/DataExport";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  Briefcase,
  Mail,
  Phone,
  Loader2,
  Trash2,
  Settings,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Employees() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const [, navigate] = useLocation();
  const { allowed, isLoading } = useRequireFeature("hr:employees:view");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [bulkStatusChangeOpen, setBulkStatusChangeOpen] = useState(false);
  const [bulkDepartmentChangeOpen, setBulkDepartmentChangeOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("active");
  const [bulkDepartment, setBulkDepartment] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [newEmployee, setNewEmployee] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    department: "",
    position: "",
    jobGroupId: "",
    salary: 0,
    employmentType: "full_time",
    status: "active",
    photoUrl: "",
    address: "",
    emergencyContact: "",
    bankAccountNumber: "",
    taxId: "",
    nationalId: "",
  });

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP LEVEL - BEFORE ANY EARLY RETURNS
  // Data fetching queries
  const { data: employees = [], isLoading: employeesLoading } = trpc.employees.list.useQuery();
  const { data: jobGroups = [] } = trpc.jobGroups.list.useQuery();
  const utils = trpc.useUtils();

  // Convert frozen Drizzle objects to plain JS for React dependencies
  const plainEmployees = Array.isArray(employees)
    ? employees.map((emp: any) => JSON.parse(JSON.stringify(emp)))
    : [];

  const filteredEmployees = useMemo(() => {
    return plainEmployees.filter((employee: any) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        (employee.employeeNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (employee.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (employee.department?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plainEmployees, searchQuery, statusFilter]);

  // Mutations - defined before any conditional returns
  const createMutation = trpc.employees.create.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success("Employee added successfully");
      setIsAddDialogOpen(false);
      setPhotoPreview(null);
      setNewEmployee({
        employeeNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        department: "",
        position: "",
        jobGroupId: "",
        salary: 0,
        employmentType: "full_time",
        status: "active",
        photoUrl: "",
        address: "",
        emergencyContact: "",
        bankAccountNumber: "",
        taxId: "",
        nationalId: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add employee: ${error.message}`);
    },
  });

  const deleteMutation = trpc.employees.delete.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete employee: ${error.message}`);
    },
  });

  // Bulk operations mutations
  const bulkUpdateStatusMutation = trpc.employees.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success(`Updated status for ${selectedEmployees.size} employees`);
      setSelectedEmployees(new Set());
      setBulkStatusChangeOpen(false);
    },
    onError: (error) => {
      toast.error(`Bulk status update failed: ${error.message}`);
    },
  });

  const bulkUpdateDepartmentMutation = trpc.employees.bulkUpdateDepartment.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success(`Updated department for ${selectedEmployees.size} employees`);
      setSelectedEmployees(new Set());
      setBulkDepartmentChangeOpen(false);
    },
    onError: (error) => {
      toast.error(`Bulk department update failed: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.employees.bulkDelete.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success(`Deleted ${selectedEmployees.size} employees`);
      setSelectedEmployees(new Set());
    },
    onError: (error) => {
      toast.error(`Bulk delete failed: ${error.message}`);
    },
  });

  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleBulkStatusChange = () => {
    const employeeIds = Array.from(selectedEmployees);
    bulkUpdateStatusMutation.mutate({ employeeIds, status: bulkStatus });
  };

  const handleBulkDepartmentChange = () => {
    const employeeIds = Array.from(selectedEmployees);
    bulkUpdateDepartmentMutation.mutate({ employeeIds, department: bulkDepartment });
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedEmployees.size} employees?`)) {
      const employeeIds = Array.from(selectedEmployees);
      bulkDeleteMutation.mutate(employeeIds);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "on-leave": return "outline";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <UserCheck className="h-3 w-3" />;
      case "inactive": return <UserX className="h-3 w-3" />;
      case "on-leave": return <Briefcase className="h-3 w-3" />;
      default: return null;
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPhotoPreview(base64String);
      setNewEmployee({ ...newEmployee, photoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const clearPhotoUpload = () => {
    setPhotoPreview(null);
    setNewEmployee({ ...newEmployee, photoUrl: "" });
  };

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email || !newEmployee.jobGroupId) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email, and Job Group)");
      return;
    }

    createMutation.mutate({
      employeeNumber: newEmployee.employeeNumber || `EMP-${Date.now()}`,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email,
      phone: newEmployee.phone || undefined,
      dateOfBirth: newEmployee.dateOfBirth ? new Date(newEmployee.dateOfBirth) : undefined,
      hireDate: new Date(),
      department: newEmployee.department || undefined,
      position: newEmployee.position || undefined,
      jobGroupId: newEmployee.jobGroupId,
      salary: newEmployee.salary > 0 ? newEmployee.salary : undefined,
      employmentType: newEmployee.employmentType,
      status: newEmployee.status,
      photoUrl: newEmployee.photoUrl || undefined,
      address: newEmployee.address || undefined,
      emergencyContact: newEmployee.emergencyContact || undefined,
      bankAccountNumber: newEmployee.bankAccountNumber || undefined,
      taxId: newEmployee.taxId || undefined,
      nationalId: newEmployee.nationalId || undefined,
    });
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteMutation.mutate(id);
    }
  };

  const activeEmployees = employees.filter((e: any) => e.status === "active").length;
  const onLeaveEmployees = employees.filter((e: any) => e.status === "on-leave").length;
  const totalSalary = employees.reduce((sum: number, e: any) => sum + (e.salary || 0), 0);

  const exportFiltered = () => {
    const ids = filteredEmployees.map((e: any) => e.id);
    if (ids.length === 0) {
      toast.error("No records to export");
      return;
    }
    trpc.dataExport.exportEmployeesCSV
      .fetch({ ids })
      .then((resp: any) => {
        if (resp?.content) {
          const blob = new Blob([resp.content], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = resp.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("Export completed successfully");
        }
      })
      .catch(() => toast.error("Export failed"));
  };

  return (
    <ModuleLayout
      title="Employees"
      description="Manage your workforce and employee information"
      icon={<Users className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Employees" },
      ]}
      actions={
        <>
          <Button variant="outline" onClick={exportFiltered}>
            <Download className="mr-2 h-4 w-4" />
            Export Filtered
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the employee details below to add them to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="+254 712 345 678"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newEmployee.dateOfBirth}
                      onChange={(e) => setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobGroupId">Job Group *</Label>
                    <Select
                      value={newEmployee.jobGroupId}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, jobGroupId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job group" />
                      </SelectTrigger>
                      <SelectContent>
                        {(jobGroups as any[]).map((group: any) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Ksh)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newEmployee.salary || ""}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select
                      value={newEmployee.employmentType}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, employmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-4">Employee Photo</h4>
                  <div className="flex flex-col gap-4">
                    {photoPreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Photo preview"
                          className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={clearPhotoUpload}
                          className="absolute -top-2 -right-2"
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="photoUpload" className="text-sm">
                        Upload Photo (max 5MB, optional)
                      </Label>
                      <input
                        id="photoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md p-2 cursor-pointer hover:border-gray-400"
                      />
                      <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Media Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newEmployee.status}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select
                      value={newEmployee.employmentType}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, employmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Fields Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-4">Additional Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationalId">National ID</Label>
                      <Input
                        id="nationalId"
                        value={newEmployee.nationalId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, nationalId: e.target.value })}
                        placeholder="ID card number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID (PIN)</Label>
                      <Input
                        id="taxId"
                        value={newEmployee.taxId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, taxId: e.target.value })}
                        placeholder="A000000000X"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                      placeholder="123 Main Street, Nairobi"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                      <Input
                        id="bankAccountNumber"
                        value={newEmployee.bankAccountNumber}
                        onChange={(e) => setNewEmployee({ ...newEmployee, bankAccountNumber: e.target.value })}
                        placeholder="0123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={newEmployee.emergencyContact}
                        onChange={(e) => setNewEmployee({ ...newEmployee, emergencyContact: e.target.value })}
                        placeholder="Name and phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      {/* Bulk Actions Bar */}
      {selectedEmployees.size > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-900">
              {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? "s" : ""} selected
            </div>
            <div className="flex gap-2">
              <BulkExportManager
                documentType="employee"
                selectedIds={Array.from(selectedEmployees)}
              />
              <Dialog open={bulkStatusChangeOpen} onOpenChange={setBulkStatusChangeOpen}>
                <Button variant="outline" size="sm">
                  <Settings className="mr-1 h-4 w-4" />
                  Change Status
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Status</DialogTitle>
                  </DialogHeader>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBulkStatusChangeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkStatusChange}>
                      Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={bulkDepartmentChangeOpen} onOpenChange={setBulkDepartmentChangeOpen}>
                <Button variant="outline" size="sm">
                  <Briefcase className="mr-1 h-4 w-4" />
                  Change Department
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Department</DialogTitle>
                  </DialogHeader>
                  <Select value={bulkDepartment} onValueChange={setBulkDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBulkDepartmentChangeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkDepartmentChange}>
                      Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">{activeEmployees} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onLeaveEmployees}</div>
            <p className="text-xs text-muted-foreground">Current</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(employees.map((e: any) => e.department)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Ksh {(totalSalary / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">Total salary</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            {filteredEmployees.length} of {employees.length} employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No employees found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmployees(new Set(filteredEmployees.map((e: any) => e.id)));
                        } else {
                          setSelectedEmployees(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-12">Photo</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee: any) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.has(employee.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedEmployees);
                          if (checked) {
                            newSet.add(employee.id);
                          } else {
                            newSet.delete(employee.id);
                          }
                          setSelectedEmployees(newSet);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.photoUrl || undefined} alt={`${employee.firstName} ${employee.lastName}`} />
                        <AvatarFallback className="text-xs">
                          {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {employee.employeeNumber}
                    </TableCell>
                    <TableCell>
                      {(employee.firstName || "")} {(employee.lastName || "")}
                    </TableCell>
                    <TableCell className="text-sm">{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(employee.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(employee.status)}
                          {employee.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>Ksh {(employee.salary || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <ActionButtons
                        id={employee.id}
                        handlers={{
                          onView: () => navigate(`/employees/${employee.id}`),
                          onEdit: () => navigate(`/employees/${employee.id}/edit`),
                          onDelete: () => handleDeleteEmployee(employee.id),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ModuleLayout>
  );
}
