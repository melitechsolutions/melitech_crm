import { useState } from "react";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowUpDown,
  Loader2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

interface InvoiceDisplay {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail?: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft" | "sent";
  issueDate: string;
  dueDate: string;
  project?: string;
  createdBy?: string;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

type SortField = "invoiceNumber" | "client" | "amount" | "issueDate" | "dueDate" | "status";
type SortOrder = "asc" | "desc";

const iconMap = {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
};

export default function Invoices() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:invoices:view");
  const { allowed: canEmail, isLoading: emailLoading } = useRequireFeature("communications:email");
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

  // Fetch real data from backend
  const { data: invoicesData = [], isLoading: isLoadingInvoices } = trpc.invoices.list.useQuery();
  const { data: clientsData = [] } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();
  
  // Delete mutation
  const deleteInvoiceMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      toast.success("Invoice deleted successfully");
      setSelectedInvoices(new Set());
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete invoice");
    },
  });

  // email reminder mutation
  const sendReminderMutation = trpc.email.sendPaymentReminder.useMutation({
    onSuccess: () => {
      toast.success("Payment reminder sent");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send reminder");
    },
  });

  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading || emailLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  // Safely convert frozen Drizzle objects to plain JS objects
  const plainInvoicesData = (() => {
    if (!Array.isArray(invoicesData)) return [];
    return invoicesData.map(inv => {
      try {
        return JSON.parse(JSON.stringify(inv));
      } catch {
        return inv;
      }
    });
  })();

  const plainClientsData = (() => {
    if (!Array.isArray(clientsData)) return [];
    return clientsData.map(client => {
      try {
        return JSON.parse(JSON.stringify(client));
      } catch {
        return client;
      }
    });
  })();

  // Transform backend data to display format
  const invoices: InvoiceDisplay[] = (() => {
    if (!Array.isArray(plainInvoicesData)) return [];
    
    return plainInvoicesData.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${inv.id.slice(0, 8)}`,
      client: (plainClientsData as any[]).find((c: any) => c.id === inv.clientId)?.companyName || "Unknown Client",
      clientEmail: (plainClientsData as any[]).find((c: any) => c.id === inv.clientId)?.email,
      amount: (inv.total || 0) / 100,
      status: inv.status || "draft",
      issueDate: inv.issueDate ? format(new Date(inv.issueDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      dueDate: inv.dueDate ? format(new Date(inv.dueDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      project: inv.projectId ? "Project" : undefined,
      createdBy: inv.createdBy || "System",
      createdAt: inv.createdAt ? format(new Date(inv.createdAt), "yyyy-MM-dd HH:mm") : undefined,
      approvedBy: inv.approvedBy || undefined,
      approvedAt: inv.approvedAt ? format(new Date(inv.approvedAt), "yyyy-MM-dd HH:mm") : undefined,
    }));
  })();

  // Filter and sort invoices
  const filteredAndSortedInvoices = (() => {
    let result = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.project?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "amount") {
        aVal = parseFloat(String(aVal));
        bVal = parseFloat(String(bVal));
      } else if (sortField === "issueDate" || sortField === "dueDate") {
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

  const stats = (() => {
    const localeOptions = { minimumFractionDigits: 2 };
    return [
      {
        title: "Total Invoiced",
        value: `Ksh ${(invoices || []).reduce((sum, inv) => sum + inv.amount, 0).toLocaleString(undefined, localeOptions)}`,
        description: "All time",
        iconName: "DollarSign" as keyof typeof iconMap,
      },
      {
        title: "Paid",
        value: `Ksh ${(invoices || []).filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0).toLocaleString(undefined, localeOptions)}`,
        description: `${(invoices || []).filter((inv) => inv.status === "paid").length} invoices`,
        iconName: "CheckCircle2" as keyof typeof iconMap,
      },
      {
        title: "Pending",
        value: `Ksh ${(invoices || []).filter((inv) => inv.status === "pending" || inv.status === "sent").reduce((sum, inv) => sum + inv.amount, 0).toLocaleString(undefined, localeOptions)}`,
        description: `${(invoices || []).filter((inv) => inv.status === "pending" || inv.status === "sent").length} invoices`,
        iconName: "Clock" as keyof typeof iconMap,
      },
      {
        title: "Overdue",
        value: `Ksh ${(invoices || []).filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0).toLocaleString(undefined, localeOptions)}`,
        description: `${(invoices || []).filter((inv) => inv.status === "overdue").length} invoices`,
        iconName: "AlertCircle" as keyof typeof iconMap,
      },
    ];
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
      case "sent": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "overdue": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <ModuleLayout
      title="Invoices"
      description="Manage your invoices and track payments"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Invoices" },
      ]}
      actions={
        <Button onClick={() => navigate("/invoices/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      }
    >
      <div className="space-y-6">
        {selectedInvoices.size > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                selectedInvoices.forEach((invId) => {
                  const inv = invoices.find((i) => i.id === invId);
                  if (inv && inv.clientEmail) {
                    if (canEmail) sendReminderMutation.mutate({ invoiceId: invId, recipientEmail: inv.clientEmail });
                  }
                });
              }}
            >
              <Mail className="mr-1 h-4 w-4" />
              Send Reminders
            </Button>
          </div>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
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
                placeholder="Search invoices..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
                  <TableHead className="w-12">
                    {/* selection column */}
                    <Checkbox
                      checked={selectedInvoices.size === filteredAndSortedInvoices.length && filteredAndSortedInvoices.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedInvoices(new Set(filteredAndSortedInvoices.map(i => i.id)));
                        } else {
                          setSelectedInvoices(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("invoiceNumber") }>
                    Invoice # {sortField === "invoiceNumber" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("client") }>
                    Client {sortField === "client" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("amount") }>
                    Amount {sortField === "amount" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("issueDate") }>
                    Date {sortField === "issueDate" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingInvoices ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedInvoices.has(inv.id)}
                          onCheckedChange={(checked) => {
                            const newSet = new Set(selectedInvoices);
                            if (checked) newSet.add(inv.id);
                            else newSet.delete(inv.id);
                            setSelectedInvoices(newSet);
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.client}</TableCell>
                      <TableCell className="text-right font-semibold">
                        Ksh {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{inv.issueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(inv.status)}>
                          {(inv.status || 'draft').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inv.approvedBy || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inv.approvedAt || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inv.createdBy || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${inv.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${inv.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(inv.status === "overdue" || inv.status === "pending" || inv.status === "sent") && inv.clientEmail && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => canEmail && sendReminderMutation.mutate({ invoiceId: inv.id, recipientEmail: inv.clientEmail! })}
                              disabled={!canEmail || sendReminderMutation.isPending}
                              title="Send payment reminder"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => {
                            if(confirm("Delete this invoice?")) deleteInvoiceMutation.mutate(inv.id);
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
