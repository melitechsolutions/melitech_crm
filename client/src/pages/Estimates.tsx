import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Plus,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";

const iconMap = {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
};

interface EstimateDisplay {
  id: string;
  quoteNumber: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  issueDate: string;
  expiryDate: string;
  project?: string;
  validDays: number;
}

type SortField = "quoteNumber" | "client" | "amount" | "issueDate" | "expiryDate" | "status";
type SortOrder = "asc" | "desc";

export default function Estimates() {
  const { allowed, isLoading } = useRequireFeature("estimates:read");
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEstimates, setSelectedEstimates] = useState<Set<string>>(new Set());

  // Data fetching hooks - enabled flag prevents queries when not allowed
  const { data: estimatesData = [], isLoading: estimatesLoading } = trpc.estimates.list.useQuery(undefined, { enabled: allowed });
  const { data: clientsData = [] } = trpc.clients.list.useQuery(undefined, { enabled: allowed });
  const utils = trpc.useUtils();

  // Delete mutation - must be called unconditionally (React Rules of Hooks)
  const deleteEstimateMutation = trpc.estimates.delete.useMutation({
    onSuccess: () => {
      toast.success("Estimate deleted successfully");
      utils.estimates.list.invalidate();
      setSelectedEstimates(new Set());
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete estimate");
    },
  });

  // NOW we can return early with conditional content - all hooks have been called
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  // Deep copy frozen Drizzle objects to ensure plain JS objects for React dependencies
  const plainEstimatesData = (() => {
    if (!Array.isArray(estimatesData)) return [];
    return estimatesData.map((est: any) => {
      try {
        return JSON.parse(JSON.stringify(est));
      } catch {
        return est;
      }
    });
  })();

  const plainClientsData = (() => {
    if (!Array.isArray(clientsData)) return [];
    return clientsData.map((client: any) => {
      try {
        return JSON.parse(JSON.stringify(client));
      } catch {
        return client;
      }
    });
  })();

  // Transform backend data to display format
  const estimates: EstimateDisplay[] = (() => {
    return (plainEstimatesData as any[]).map((est: any) => ({
      id: est.id,
      quoteNumber: est.estimateNumber || `EST-${est.id.slice(0, 8)}`,
      client: (plainClientsData as any[]).find((c: any) => c.id === est.clientId)?.companyName || "Unknown Client",
      amount: (est.total || 0) / 100,
      status: est.status || "draft",
      issueDate: est.issueDate ? format(new Date(est.issueDate), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
      expiryDate: est.expiryDate ? format(new Date(est.expiryDate), "yyyy-MM-dd") : "",
      project: est.projectId ? "Project" : undefined,
      validDays: 45,
    }));
  })();

  // Filter and sort estimates
  const filteredAndSortedEstimates = (() => {
    let result = estimates.filter((estimate) => {
      const matchesSearch =
        estimate.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        estimate.project?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || estimate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "amount") {
        aVal = parseFloat(String(aVal));
        bVal = parseFloat(String(bVal));
      } else if (sortField === "issueDate" || sortField === "expiryDate") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  })();

  const stats = (() => [
    {
      title: "Total Estimates",
      value: `Ksh ${estimates.reduce((sum, est) => sum + est.amount, 0).toLocaleString()}`,
      description: "All time",
      iconName: "DollarSign" as keyof typeof iconMap,
    },
    {
      title: "Accepted",
      value: `Ksh ${estimates
        .filter((est) => est.status === "accepted")
        .reduce((sum, est) => sum + est.amount, 0)
        .toLocaleString()}`,
      description: `${estimates.filter((est) => est.status === "accepted").length} estimates`,
      iconName: "CheckCircle2" as keyof typeof iconMap,
    },
    {
      title: "Pending",
      value: `Ksh ${estimates
        .filter((est) => est.status === "sent" || est.status === "draft")
        .reduce((sum, est) => sum + est.amount, 0)
        .toLocaleString()}`,
      description: `${estimates.filter((est) => est.status === "sent" || est.status === "draft").length} estimates`,
      iconName: "Clock" as keyof typeof iconMap,
    },
    {
      title: "Expired",
      value: estimates.filter((est) => est.status === "expired").length,
      description: "Need renewal",
      iconName: "AlertCircle" as keyof typeof iconMap,
    },
  ])();

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "expired": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <ModuleLayout
      title="Estimates"
      description="Create and manage estimates"
      icon={<FileText className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Sales", href: "/sales" },
        { label: "Estimates", href: "/estimates" },
      ]}
      actions={
        <Button onClick={() => navigate("/estimates/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Estimate
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = iconMap[stat.iconName];
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estimates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("quoteNumber")}>
                    Estimate # {sortField === "quoteNumber" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("client")}>
                    Client {sortField === "client" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("amount")}>
                    Amount {sortField === "amount" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("issueDate")}>
                    Date {sortField === "issueDate" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading estimates...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedEstimates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No estimates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedEstimates.map((est) => (
                    <TableRow key={est.id}>
                      <TableCell className="font-medium">{est.quoteNumber}</TableCell>
                      <TableCell>{est.client}</TableCell>
                      <TableCell className="text-right font-semibold">
                        Ksh {est.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{est.issueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(est.status)}>
                          {(est.status || 'draft').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/estimates/${est.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/estimates/${est.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            if(confirm("Delete this estimate?")) deleteEstimateMutation.mutate(est.id);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
