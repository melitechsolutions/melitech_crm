import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
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
import { FileText, Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function QuotationsPage() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("quotations:view");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch quotations from backend
  const { data: quotationsData, isLoading: dataLoading, refetch } = trpc.quotations.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: allowed }
  );

  const quotations = quotationsData?.data || [];

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  const filteredQuotations = quotations.filter(q =>
    q.rfqNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "approved") return "default";
    if (status === "under_review") return "secondary";
    return "outline";
  };

  return (
    <ModuleLayout
      title="Quotations & RFQs"
      description="Request and manage quotations from suppliers"
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Procurement", href: "/procurement" },
        { label: "Quotations" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quotations & RFQs</h2>
            <p className="text-sm text-muted-foreground">Request and compare supplier quotations</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> New RFQ</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quotations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quotation Requests</CardTitle>
            <CardDescription>{filteredQuotations.length} quotations</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-32"><Spinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotations.map(q => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.rfqNo}</TableCell>
                        <TableCell>{q.supplier}</TableCell>
                        <TableCell>{q.description}</TableCell>
                        <TableCell>Ksh {q.amount.toLocaleString()}</TableCell>
                        <TableCell>{q.dueDate}</TableCell>
                        <TableCell><Badge variant={statusColor(q.status)}>{q.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
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
