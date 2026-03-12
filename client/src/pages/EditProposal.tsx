import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
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
import { FileText, ArrowLeft, Loader2 } from "lucide-react";

export default function EditProposal() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    proposalNumber: "",
    clientId: "",
    title: "",
    description: "",
    amount: "",
    validUntil: new Date().toISOString().split("T")[0],
    status: "draft",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const { data: proposal } = trpc.opportunities.getById.useQuery(
    id || "",
    { enabled: !!id }
  );

  const { data: clients = [] } = trpc.clients.list.useQuery();

  useEffect(() => {
    if (proposal) {
      setFormData({
        proposalNumber: proposal.proposalNumber || "",
        clientId: proposal.clientId || "",
        title: proposal.title || "",
        description: proposal.description || "",
        amount: proposal.amount ? (proposal.amount / 100).toString() : "",
        validUntil: proposal.validUntil
          ? new Date(proposal.validUntil).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: proposal.status || "draft",
        notes: proposal.notes || "",
      });
      setIsLoading(false);
    }
  }, [proposal]);

  const updateProposalMutation = trpc.opportunities.update.useMutation({
    onSuccess: () => {
      toast.success("Opportunity updated successfully!");
      utils.opportunities.list.invalidate();
      utils.opportunities.getById.invalidate(id || "");
      navigate("/opportunities");
    },
    onError: (error: any) => {
      toast.error(`Failed to update opportunity: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.proposalNumber || !formData.clientId || !formData.title || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateProposalMutation.mutate({
      id: id || "",
      proposalNumber: formData.proposalNumber,
      clientId: formData.clientId,
      title: formData.title,
      description: formData.description || undefined,
      amount: Math.round(parseFloat(formData.amount) * 100),
      validUntil: new Date(formData.validUntil).toISOString().split("T")[0],
      status: formData.status as any,
      notes: formData.notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Edit Opportunity"
        description="Update opportunity details"
        icon={<FileText className="w-6 h-6" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Sales", href: "/sales" },
          { label: "Opportunities", href: "/opportunities" },
          { label: "Edit Proposal" },
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
      title="Edit Opportunity"
      description="Update opportunity details"
      icon={<FileText className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Sales", href: "/sales" },
        { label: "Opportunities", href: "/opportunities" },
        { label: "Edit Proposal" },
      ]}
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Opportunity</CardTitle>
            <CardDescription>
              Update the opportunity details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proposalNumber">Opportunity Number *</Label>
                  <Input
                    id="proposalNumber"
                    placeholder="e.g., PROP-001"
                    value={formData.proposalNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, proposalNumber: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(clients) && clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName || client.contactPerson}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Opportunity Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Website Development Project"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter proposal description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Ksh) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                  />
                </div>
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
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={updateProposalMutation.isPending}
                >
                  {updateProposalMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Opportunity
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/opportunities")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}

