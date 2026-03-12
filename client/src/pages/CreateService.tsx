import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Briefcase, ArrowLeft } from "lucide-react";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";

export default function CreateService() {
  const { allowed, isLoading } = useRequireFeature("services:create");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    serviceType: "",
    rate: "",
    unit: "hour",
    status: "active",
  });

  // Fetch categories and units for dropdowns
  const { data: categories = [] } = trpc.services.getCategories.useQuery();
  const { data: units = [] } = trpc.services.getUnits.useQuery();
  
  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully!");
      utils.services.list.invalidate();
      // Reset form state before navigating
      setFormData({
        serviceName: "",
        description: "",
        serviceType: "",
        rate: "",
        unit: "hour",
        status: "active",
      });
      navigate("/services");
    },
    onError: (error: any) => {
      toast.error(`Failed to create service: ${error.message}`);
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceName) {
      toast.error("Service name is required");
      return;
    }

    createServiceMutation.mutate({
      serviceName: formData.serviceName,
      description: formData.description || undefined,
      serviceType: formData.serviceType || undefined,
      rate: formData.rate ? parseFloat(formData.rate) : undefined,
      unit: formData.unit || undefined,
      status: formData.status as 'active' | 'inactive',
    });
  };

  // Default categories if none exist in database
  const defaultCategories = [
    "Consulting",
    "Development",
    "Design",
    "Support",
    "Training",
    "Maintenance",
    "Installation",
    "Repair",
    "Other",
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Default units
  const defaultUnits = [
    { value: "hour", label: "Hour" },
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "project", label: "Project" },
    { value: "unit", label: "Unit" },
    { value: "item", label: "Item" },
    { value: "service", label: "Service" },
  ];

  const displayUnits = units.length > 0 
    ? units.map((u: string) => ({ value: u, label: u.charAt(0).toUpperCase() + u.slice(1) }))
    : defaultUnits;

  return (
    <ModuleLayout
      title="Create Service"
      description="Add a new service to your catalog"
      icon={<Briefcase className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Products & Services", href: "/services" },
        { label: "Create Service" },
      ]}
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Service</CardTitle>
            <CardDescription>
              Enter the service details below to add a new service to your catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="Enter service name"
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter service description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Category</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, serviceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayCategories.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayUnits.map((unit: { value: string; label: string }) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (Ksh)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="0.00"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Rate per {formData.unit || "unit"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/services")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending
                    ? "Creating..."
                    : "Create Service"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}