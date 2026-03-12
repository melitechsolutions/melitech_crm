import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CitySelect } from "@/components/LocationSelects";
import { Plus, Search, Download, Upload, Edit2, Trash2, Eye, Loader2, Star, Truck } from "lucide-react";
import { useLocation } from "wouter";

export default function SuppliersPage() {
  const [, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    city: "",
    postalCode: "",
    taxId: "",
    address: "",
  });

  // Queries
  const { data: suppliers = [], isLoading, refetch } = trpc.suppliers.list.useQuery({
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    search: searchTerm || undefined,
  });

  // Mutations
  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      toast.success("Supplier created successfully");
      setIsCreateOpen(false);
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        alternatePhone: "",
        city: "",
        postalCode: "",
        taxId: "",
        address: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create supplier");
    },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete supplier");
    },
  });

  const exportMutation = trpc.importExport.exportSuppliers.useQuery({
    format: 'csv'
  });

  const importMutation = trpc.importExport.importSuppliers.useMutation({
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported} suppliers successfully`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} rows had errors`);
      }
      refetch();
      setIsImporting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import suppliers");
      setIsImporting(false);
    },
  });

  const handleCreateSupplier = () => {
    if (!formData.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    createMutation.mutate({
      companyName: formData.companyName,
      contactPerson: formData.contactPerson || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      alternatePhone: formData.alternatePhone || undefined,
      city: formData.city || undefined,
      postalCode: formData.postalCode || undefined,
      taxId: formData.taxId || undefined,
      address: formData.address || undefined,
      qualificationStatus: "pending",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExportSuppliers = async () => {
    setIsExporting(true);
    try {
      const result = await exportMutation.refetch();
      if (result.data?.data) {
        const csvData = result.data.data;
        const element = document.createElement("a");
        const file = new Blob([csvData], { type: "text/csv" });
        element.href = URL.createObjectURL(file);
        element.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Suppliers exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export suppliers");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSuppliers = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e: any) => {
      setIsImporting(true);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          const csvText = event.target.result;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
          
          const data = lines.slice(1)
            .filter((line: string) => line.trim())
            .map((line: string) => {
              const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
              return {
                companyName: values[0] || '',
                contactPerson: values[1] || undefined,
                email: values[2] || undefined,
                phone: values[3] || undefined,
                altPhone: values[4] || undefined,
                address: values[5] || undefined,
                city: values[6] || undefined,
                postalCode: values[7] || undefined,
                taxIdPin: values[8] || undefined,
                website: values[9] || undefined,
                paymentTerms: values[10] || undefined,
                qualificationStatus: values[11] || 'pending',
                notes: values[16] || undefined,
              };
            });

          importMutation.mutate({
            data,
            skipDuplicates: true,
          });
        } catch (error) {
          toast.error("Failed to parse CSV file");
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      pre_qualified: { color: "bg-blue-100 text-blue-800", label: "Pre-qualified" },
      qualified: { color: "bg-green-100 text-green-800", label: "Qualified" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-green-600";
    if (rating >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ModuleLayout
      title="Suppliers"
      description="Manage supplier information, ratings, and audit records"
      icon={<Truck className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm" },
        { label: "Procurement", href: "/procurement" },
        { label: "Suppliers" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImporting(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button size="sm" onClick={() => setIsExporting(true)} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Supplier
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Create Supplier Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Enter supplier information to register a new supplier
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC Supplies Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="supplier@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 712 345 678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      placeholder="+254 712 345 679"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / PIN</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      placeholder="A001234567N"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City/Town</Label>
                    <CitySelect
                      value={formData.city || ""}
                      onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                      label=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="00100"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSupplier} disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Supplier"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by company name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pre_qualified">Pre-qualified</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers List */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers List</CardTitle>
            <CardDescription>Total: {suppliers.length} suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No suppliers found. Click "Add Supplier" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier: any) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.companyName}</TableCell>
                        <TableCell>{supplier.contactPerson || "-"}</TableCell>
                        <TableCell>{supplier.phone || "-"}</TableCell>
                        <TableCell className="text-sm">{supplier.email || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 ${getRatingColor(supplier.averageRating)}`} />
                            <span className={`font-semibold ${getRatingColor(supplier.averageRating)}`}>
                              {supplier.averageRating || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(supplier.qualificationStatus)}</TableCell>
                        <TableCell>{supplier.city || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/suppliers/${supplier.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this supplier?")) {
                                deleteMutation.mutate(supplier.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
