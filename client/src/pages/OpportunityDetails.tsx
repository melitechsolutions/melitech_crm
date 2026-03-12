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

export default function OpportunityDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch opportunity from backend
  const { data: opportunityData, isLoading } = trpc.opportunities.getById.useQuery(id || "");
  const utils = trpc.useUtils();

  const deleteOpportunityMutation = trpc.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Opportunity deleted successfully");
      utils.opportunities.list.invalidate();
      navigate("/opportunities");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete opportunity");
    },
  });

  const opportunity = opportunityData ? {
    id: opportunityData.id || id || "1",
    name: (opportunityData as any).name || "Unknown Opportunity",
    client: (opportunityData as any).clientId || "Unknown Client",
    value: ((opportunityData as any).value || 0) / 100,
    stage: (opportunityData as any).stage || "prospecting",
    probability: (opportunityData as any).probability || 0,
    expectedClose: (opportunityData as any).expectedCloseDate ? new Date((opportunityData as any).expectedCloseDate).toISOString().split('T')[0] : "",
    status: (opportunityData as any).status || "active",
    owner: (opportunityData as any).owner || "",
    source: (opportunityData as any).source || "",
    notes: (opportunityData as any).notes || "",
  } : null;

  const handleEdit = () => {
    navigate(`/opportunities/${id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteOpportunityMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      prospecting: "Prospecting",
      qualification: "Qualification",
      proposal: "Proposal",
      negotiation: "Negotiation",
      closed_won: "Closed Won",
      closed_lost: "Closed Lost",
    };
    return labels[stage] || stage;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading opportunity...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!opportunity) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Opportunity not found</p>
          <Button onClick={() => navigate("/opportunities")}>Back to Opportunities</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/opportunities")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{opportunity.name}</h1>
            <p className="text-muted-foreground">{opportunity.client}</p>
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
            <CardTitle>Opportunity Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Value</label>
                <p className="text-muted-foreground">Ksh {(opportunity.value || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Stage</label>
                <Badge>{getStageLabel(opportunity.stage)}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Probability</label>
                <p className="text-muted-foreground">{opportunity.probability}%</p>
              </div>
              <div>
                <label className="text-sm font-medium">Expected Close</label>
                <p className="text-muted-foreground">{opportunity.expectedClose || "Not set"}</p>
              </div>
              {opportunity.owner && (
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p className="text-muted-foreground">{opportunity.owner}</p>
                </div>
              )}
              {opportunity.source && (
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <p className="text-muted-foreground">{opportunity.source}</p>
                </div>
              )}
              {opportunity.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-muted-foreground">{opportunity.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Opportunity"
        description="Are you sure you want to delete this opportunity? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
