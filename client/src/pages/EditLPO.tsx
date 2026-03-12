import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ModuleLayout } from "@/components/ModuleLayout";
import { FileText, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EditLPO() {
  const { allowed, isLoading } = useRequireFeature("procurement:lpo:edit");
  
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/lpos/:id/edit");
  const utils = trpc.useUtils();
  
  const lpoId = params?.id;

  const [formData, setFormData] = useState({
    vendorId: "",
    vendorName: "",
    description: "",
    amount: 0,
    lpoNumber: "",
  });

  const [isLoadingLPO, setIsLoadingLPO] = useState(true);

  const getLPO = trpc.lpo.getById.useQuery(lpoId || "", {
    enabled: !!lpoId,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          vendorId: data.vendorId,
          vendorName: data.vendorName || "",
          description: data.description || "",
          amount: data.amount ? data.amount / 100 : 0, // Convert from cents
          lpoNumber: data.lpoNumber,
        });
      }
      setIsLoadingLPO(false);
    },
    onError: () => {
      toast.error("Failed to load LPO");
      setIsLoadingLPO(false);
    },
  });

  const updateLPOMutation = trpc.lpo.update.useMutation({
    onSuccess: () => {
      toast.success("LPO updated successfully!");
      utils.lpo.list.invalidate();
      navigate("/lpos");
    },
    onError: (error: any) => {
      toast.error(`Failed to update LPO: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lpoId) {
      toast.error("LPO ID not found");
      return;
    }

    if (!formData.vendorId || formData.amount <= 0) {
      toast.error("Please fill in vendor ID and amount");
      return;
    }

    updateLPOMutation.mutate({
      id: lpoId,
      vendorId: formData.vendorId,
      description: formData.description || undefined,
      amount: Math.round(formData.amount * 100), // Convert to cents
    });
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Edit Local Purchase Order"
        description="Update LPO details"
        icon={<FileText className="w-6 h-6" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "LPOs", href: "/lpos" },
          { label: "Edit LPO" },
        ]}
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Loading LPO...</p>
          </CardContent>
        </Card>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit Local Purchase Order"
      description="Update LPO details"
      icon={<FileText className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "LPOs", href: "/lpos" },
        { label: "Edit LPO" },
      ]}
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>LPO Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lpoNumber">LPO Number</Label>
                  <Input
                    id="lpoNumber"
                    value={formData.lpoNumber}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorId">Vendor ID *</Label>
                  <Input
                    id="vendorId"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    placeholder="Enter vendor ID"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="Enter vendor name (optional)"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter LPO description (optional)"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/lpos")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={updateLPOMutation.isPending}>
                  {updateLPOMutation.isPending ? "Updating..." : "Update LPO"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
