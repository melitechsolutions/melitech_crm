import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Search, Eye, Edit, Trash2, Download, Send, TrendingUp, Clock, CheckCircle2, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Proposals() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const utils = trpc.useUtils();
  const { data: proposals = [], isLoading } = trpc.opportunities.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  
  const createProposalMutation = trpc.opportunities.create.useMutation({
    onSuccess: () => {
      toast.success("Opportunity created successfully");
      utils.opportunities.list.invalidate();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteProposalMutation = trpc.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Opportunity deleted");
      utils.opportunities.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const [newProposal, setNewProposal] = useState({
    clientId: "",
    title: "",
    description: "",
    value: 0,
    stage: "proposal" as const,
    expectedCloseDate: new Date().toISOString().split('T')[0]
  });

  const handleCreate = () => {
    if (!newProposal.clientId || !newProposal.title) {
      toast.error("Please fill in all required fields");
      return;
    }
    createProposalMutation.mutate({
      ...newProposal,
      value: Math.round(newProposal.value * 100),
      expectedCloseDate: new Date(newProposal.expectedCloseDate)
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      lead: "bg-gray-100 text-gray-700",
      qualified: "bg-blue-100 text-blue-700",
      proposal: "bg-purple-100 text-purple-700",
      negotiation: "bg-orange-100 text-orange-700",
      closed_won: "bg-green-100 text-green-700",
      closed_lost: "bg-red-100 text-red-700",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100"}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredProposals = proposals.filter((proposal) => {
    const client = clients.find(c => c.id === proposal.clientId);
    const clientName = client?.companyName || "";
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || proposal.stage === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = proposals.reduce((sum, p) => sum + (p.value || 0), 0);
  const acceptedValue = proposals.filter(p => p.stage === "closed_won").reduce((sum, p) => sum + (p.value || 0), 0);
  const activeValue = proposals.filter(p => p.stage !== "closed_won" && p.stage !== "closed_lost").reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <ModuleLayout title="Opportunities" description="Create and manage business opportunities" icon={FileText as any} breadcrumbs={[{ label: "Dashboard" }, { label: "Sales" }, { label: "Opportunities" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>Create New Opportunity</DialogTitle>
                <DialogDescription>Fill in the details to create a new business opportunity</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select onValueChange={(val) => setNewProposal({...newProposal, clientId: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.companyName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Expected Close Date</Label>
                    <Input 
                      id="validUntil" 
                      type="date" 
                      value={newProposal.expectedCloseDate}
                      onChange={(e) => setNewProposal({...newProposal, expectedCloseDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Opportunity Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter opportunity title" 
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter proposal description" 
                    rows={4} 
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Estimated Value (Ksh)</Label>
                    <Input 
                      id="value" 
                      type="number" 
                      placeholder="0" 
                      value={newProposal.value}
                      onChange={(e) => setNewProposal({...newProposal, value: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
                <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createProposalMutation.isPending}>
                  {createProposalMutation.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(activeValue / 100).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(acceptedValue / 100).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{proposals.filter(p => p.stage === "closed_won").length} deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(proposals.length > 0 ? totalValue / proposals.length / 100 : 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per opportunity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Probability</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proposals.length > 0 ? Math.round(proposals.reduce((sum, p) => sum + (p.probability || 0), 0) / proposals.length) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Win confidence</p>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>All Opportunities</CardTitle>
            <CardDescription>View and manage your business opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></TableCell></TableRow>
                ) : filteredProposals.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No opportunities found</TableCell></TableRow>
                ) : filteredProposals.map((proposal) => {
                  const client = clients.find(c => c.id === proposal.clientId);
                  return (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.title}</TableCell>
                      <TableCell>{client?.companyName || "Unknown Client"}</TableCell>
                      <TableCell>Ksh {(proposal.value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{getStatusBadge(proposal.stage || "proposal")}</TableCell>
                      <TableCell>{proposal.expectedCloseDate ? new Date(proposal.expectedCloseDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            if(confirm("Delete this opportunity?")) deleteProposalMutation.mutate(proposal.id);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
