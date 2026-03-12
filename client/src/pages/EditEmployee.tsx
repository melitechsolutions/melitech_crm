import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Loader2, Trash2, Save, Upload, X, Plus } from "lucide-react";

export default function EditEmployee() {
  const params = useParams<{ id: string }>();
  const employeeId = params.id;
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    hireDate: new Date().toISOString().split("T")[0],
    department: "",
    position: "",
    jobGroupId: "",
    salary: "",
    employmentType: "full_time",
    photoUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employee data, departments, and job groups
  const { data: employee } = trpc.employees.getById.useQuery(employeeId || "", {
    enabled: !!employeeId,
  });
  const { data: departmentsData = [], isLoading: departmentsLoading } = trpc.departments.list.useQuery();
  const { data: jobGroupsData = [], isLoading: jobGroupsLoading } = trpc.jobGroups.list.useQuery();

  // Update form when employee data loads
  useEffect(() => {
    if (employee) {
      setFormData({
        employeeNumber: employee.employeeNumber || "",
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        dateOfBirth: employee.dateOfBirth
          ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
          : "",
        hireDate: employee.hireDate
          ? new Date(employee.hireDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        department: employee.department || "",
        position: employee.position || "",
        jobGroupId: employee.jobGroupId || "",
        salary: employee.salary ? (employee.salary / 100).toString() : "",
        employmentType: employee.employmentType || "full-time",
        photoUrl: employee.photoUrl || "",
      });
      if (employee.photoUrl) {
        setPhotoPreview(employee.photoUrl);
      }
      setIsLoading(false);
    }
  }, [employee]);

  const updateEmployeeMutation = trpc.employees.update.useMutation({
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      utils.employees.list.invalidate();
      utils.employees.getById.invalidate(employeeId || "");
      navigate("/employees");
    },
    onError: (error: any) => {
      toast.error(`Failed to update employee: ${error.message}`);
    },
  });

  const deleteEmployeeMutation = trpc.employees.delete.useMutation({
    onSuccess: () => {
      toast.success("Employee deleted successfully!");
      utils.employees.list.invalidate();
      navigate("/employees");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete employee: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeNumber || !formData.firstName || !formData.lastName || !formData.hireDate || !formData.jobGroupId) {
      toast.error("Please fill in all required fields (including Job Group)");
      return;
    }

    if (photoFile) {
      // Convert photo to compressed base64
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 300x300
        const maxWidth = 300;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with quality 0.7
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        if (photoDataUrl.length > 1000000) {
          toast.error("Photo is too large even after compression. Please use a smaller image.");
          return;
        }
        
        updateEmployeeMutation.mutate({
          id: employeeId || "",
          employeeNumber: formData.employeeNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          hireDate: new Date(formData.hireDate),
          department: formData.department || undefined,
          position: formData.position || undefined,
          jobGroupId: formData.jobGroupId || undefined,
          salary: formData.salary ? Math.round(parseFloat(formData.salary) * 100) : undefined,
          employmentType: formData.employmentType || undefined,
          photoUrl: photoDataUrl,
        } as any);
      };
      
      img.src = photoPreview || '';
    } else {
      updateEmployeeMutation.mutate({
        id: employeeId || "",
        employeeNumber: formData.employeeNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        hireDate: new Date(formData.hireDate),
        department: formData.department || undefined,
        position: formData.position || undefined,
        jobGroupId: formData.jobGroupId || undefined,
        salary: formData.salary ? Math.round(parseFloat(formData.salary) * 100) : undefined,
        employmentType: formData.employmentType || undefined,
      } as any);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      deleteEmployeeMutation.mutate(employeeId || "");
    }
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Edit Employee"
        description="Update employee details"
        icon={<Users className="w-6 h-6" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Employees", href: "/employees" },
          { label: "Edit Employee" },
        ]}
      >
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit Employee"
      description="Update employee details"
      icon={<Users className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Employees", href: "/employees" },
        { label: "Edit Employee" },
      ]}
    >
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Employee</CardTitle>
            <CardDescription>
              Update the employee details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">Employee Number *</Label>
                  <Input
                    id="employeeNumber"
                    placeholder="e.g., EMP-001"
                    value={formData.employeeNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeNumber: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) =>
                      setFormData({ ...formData, hireDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employmentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="contractual">Contractual</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="wage">Wage</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="flex gap-2">
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger id="department" className="flex-1">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsLoading ? (
                          <SelectItem value="" disabled>
                            Loading departments...
                          </SelectItem>
                        ) : departmentsData.length === 0 ? (
                          <SelectItem value="" disabled>
                            No departments available
                          </SelectItem>
                        ) : (
                          departmentsData.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate("/departments/create")}
                      title="Create new department"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Sales Manager"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobGroupId">Job Group *</Label>
                  <Select value={formData.jobGroupId} onValueChange={(value) => setFormData({ ...formData, jobGroupId: value })}>
                    <SelectTrigger id="jobGroupId">
                      <SelectValue placeholder="Select a job group" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobGroupsLoading ? (
                        <SelectItem value="" disabled>
                          Loading job groups...
                        </SelectItem>
                      ) : jobGroupsData.length === 0 ? (
                        <SelectItem value="" disabled>
                          No job groups available
                        </SelectItem>
                      ) : (
                        jobGroupsData.map((jg: any) => (
                          <SelectItem key={jg.id} value={jg.id}>
                            {jg.name} ({jg.minimumGrossSalary} - {jg.maximumGrossSalary})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Ksh)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="0.00"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-3">
                <Label>Employee Photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback>
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                    <div className="relative">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Photo must be less than 5MB");
                              return;
                            }
                            setPhotoFile(file);
                            
                            // Compress photo immediately on selection
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            
                            img.onload = () => {
                              // Resize to max 300x300
                              const maxWidth = 300;
                              const maxHeight = 300;
                              let width = img.width;
                              let height = img.height;
                              
                              if (width > height) {
                                if (width > maxWidth) {
                                  height *= maxWidth / width;
                                  width = maxWidth;
                                }
                              } else {
                                if (height > maxHeight) {
                                  width *= maxHeight / height;
                                  height = maxHeight;
                                }
                              }
                              
                              canvas.width = width;
                              canvas.height = height;
                              ctx?.drawImage(img, 0, 0, width, height);
                              
                              // Compress to JPEG with quality 0.7
                              const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                              setPhotoPreview(compressedData);
                            };
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("photo")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                    {photoFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(formData.photoUrl || null);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove New Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteEmployeeMutation.isPending}
                >
                  {deleteEmployeeMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete Employee
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/employees")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateEmployeeMutation.isPending}
                  >
                    {updateEmployeeMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Update Employee
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
