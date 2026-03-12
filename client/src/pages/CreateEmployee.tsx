import { useState } from "react";
import { useLocation } from "wouter";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, ArrowLeft, Plus, Upload, X, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CreateEmployee() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  
  // Fetch departments and job groups from backend
  const { data: departmentsData = [], isLoading: departmentsLoading } = trpc.departments.list.useQuery();
  const { data: jobGroupsData = [], isLoading: jobGroupsLoading } = trpc.jobGroups.list.useQuery();
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Password management state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
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

  const createEmployeeMutation = trpc.employees.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Employee created successfully!");
      
      // If a password was generated, show it to the admin
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
        setShowPasswordModal(true);
      } else {
        utils.employees.list.invalidate();
        navigate("/employees");
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to create employee: ${error.message}`);
    },
  });

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        setPasswordCopied(true);
        toast.success("Password copied to clipboard!");
        setTimeout(() => setPasswordCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy password");
      }
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPassword(null);
    setPasswordCopied(false);
    utils.employees.list.invalidate();
    navigate("/employees");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeNumber || !formData.firstName || !formData.lastName || !formData.hireDate || !formData.jobGroupId) {
      toast.error("Please fill in all required fields (including Job Group)");
      return;
    }

    if (photoFile) {
      // Convert photo to base64
      const reader = new FileReader();
      reader.onload = () => {
        const photoDataUrl = reader.result as string;
        createEmployeeMutation.mutate({
          employeeNumber: formData.employeeNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          hireDate: new Date(formData.hireDate),
          department: formData.department || undefined,
          position: formData.position || undefined,
          jobGroupId: formData.jobGroupId,
          salary: formData.salary ? Math.round(parseFloat(formData.salary) * 100) : undefined,
          employmentType: formData.employmentType || undefined,
          photoUrl: photoDataUrl,
        } as any);
      };
      reader.readAsDataURL(photoFile);
    } else {
      createEmployeeMutation.mutate({
        employeeNumber: formData.employeeNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        hireDate: new Date(formData.hireDate),
        department: formData.department || undefined,
        position: formData.position || undefined,
        jobGroupId: formData.jobGroupId,
        salary: formData.salary ? Math.round(parseFloat(formData.salary) * 100) : undefined,
        employmentType: formData.employmentType || undefined,
      } as any);
    }
  };

  return (
    <ModuleLayout
      title="Add Employee"
      description="Create a new employee record"
      icon={<Users className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Employees", href: "/employees" },
        { label: "Add Employee" },
      ]}
    >
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
            <CardDescription>
              Enter the employee details below to add a new employee to your organization
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Senior Developer"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>

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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                  <SelectTrigger id="employmentType">
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
                        Upload Photo
                      </Button>
                    </div>
                    {photoFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove Photo
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF - Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/employees")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEmployeeMutation.isPending}
                >
                  {createEmployeeMutation.isPending
                    ? "Creating..."
                    : "Add Employee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Password Display Modal */}
      {showPasswordModal && generatedPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>User Account Created</CardTitle>
              <CardDescription>
                A user account has been created for {formData.firstName} {formData.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Temporary Password (Share with the employee):
                </Label>
                <div className="flex gap-2 items-center bg-muted p-3 rounded-md">
                  <code className="flex-1 font-mono text-sm break-all select-all">
                    {generatedPassword}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPassword}
                    className="flex-shrink-0"
                  >
                    {passwordCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> The employee will be required to change this password on their first login.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> You can copy this password and send it securely to the employee, or display it for them to note down.
                </p>
              </div>

              <Button
                onClick={handleClosePasswordModal}
                className="w-full"
              >
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </ModuleLayout>
  );
}

