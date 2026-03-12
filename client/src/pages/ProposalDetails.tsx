import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Download, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import mutateAsync from '@/lib/mutationHelpers';
import { handleDelete as actionsHandleDelete, handleDownload as actionsHandleDownload, handleEmail as actionsHandleEmail } from "@/lib/actions";
import { toast } from "sonner";

export default function ProposalDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: proposal, isLoading } = trpc.opportunities.getById.useQuery(id || "", {
    enabled: !!id,
  });

  const deleteMutation = trpc.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Opportunity deleted successfully");
      navigate("/opportunities");
    },
    onError: () => toast.error("Failed to delete opportunity"),
    onSettled: () => setIsDeleting(false),
  });

  const handleEdit = () => {
    navigate(`/opportunities/${id}/edit`);
  };

  const onDelete = async () => {
    setIsDeleting(true);
    await actionsHandleDelete(id || "", "opportunity", async () => { await mutateAsync(deleteMutation, id || ""); });
  };

  const handleDownload = () => actionsHandleDownload(id || "", "proposal", "pdf", proposal);
  const handleEmail = () => {
    if (proposal) {
      actionsHandleEmail(id || "", "proposal", proposal.clientId || "Unknown", proposal);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading opportunity details...</p>
          </div>
        ) : !proposal ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Opportunity not found</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/opportunities")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{proposal.title}</h1>
                <p className="text-muted-foreground">For {proposal.clientId}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
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
                    <label className="text-sm font-medium">Title</label>
                    <p className="text-muted-foreground">{proposal.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Client ID</label>
                    <p className="text-muted-foreground">{proposal.clientId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <p className="text-muted-foreground">KES {(proposal.amount || proposal.value || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge>{proposal.status || proposal.stage || 'unknown'}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created Date</label>
                    <p className="text-muted-foreground">{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valid Until</label>
                    <p className="text-muted-foreground">{proposal.validUntil || proposal.expectedCloseDate ? new Date(proposal.validUntil || proposal.expectedCloseDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Deletion handled via handleDelete (calls TRPC) */}
      </div>
    </DashboardLayout>
  );
}
