import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import mutateAsync from '@/lib/mutationHelpers';

export default function ServiceDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch service from backend
  const { data: serviceData, isLoading } = trpc.services.getById.useQuery(id || "");
  const utils = trpc.useUtils();

  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully");
      utils.services.list.invalidate();
      navigate("/services");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete service");
    },
  });

  const service = serviceData ? {
    id: serviceData.id || id || "1",
    name: (serviceData as any).name || "Unknown Service",
    code: (serviceData as any).code || `SVC-${id}`,
    category: (serviceData as any).category || "General",
    rate: ((serviceData as any).hourlyRate || 0) / 100,
    billingType: (serviceData as any).billingType || "hourly",
    status: (serviceData as any).status || "active",
    description: (serviceData as any).description || "",
  } : null;

  const handleEdit = () => {
    navigate(`/services/${id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteServiceMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading service...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Service not found</p>
          <Button onClick={() => navigate("/services")}>Back to Services</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/services")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-muted-foreground">{service.code}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-muted-foreground">{service.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge>{service.status}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Rate</label>
                <p className="text-muted-foreground">Ksh {(service.rate || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Billing Type</label>
                <p className="text-muted-foreground">{service.billingType}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <p className="text-muted-foreground">{service.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-muted-foreground">{service.description || "No description"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
