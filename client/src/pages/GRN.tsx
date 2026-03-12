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
import { BoxIcon, Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";

export default function GoodsReceivedNotes() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("grn:view");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch GRNs from backend
  const { data: grnData, isLoading: dataLoading } = trpc.grn.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: allowed }
  );

  const grnList = grnData?.data || [];

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  const filteredGRNs = grnList.filter(g =>
    g.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "accepted") return "default";
    if (status === "partial") return "secondary";
    return "destructive";
  };

  return (
    <ModuleLayout
      title="Goods Received Notes"
      description="Manage goods received and acceptance"
      icon={<BoxIcon className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Procurement", href: "/procurement" },
        { label: "GRN" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Goods Received Notes</h2>
            <p className="text-sm text-muted-foreground">Record and track received goods</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> New GRN</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search GRNs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>GRN Registry</CardTitle>
            <CardDescription>{filteredGRNs.length} goods received notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Received Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGRNs.map(grn => (
                    <TableRow key={grn.id}>
                      <TableCell className="font-medium">{grn.grnNo}</TableCell>
                      <TableCell>{grn.supplier}</TableCell>
                      <TableCell>{grn.invNo}</TableCell>
                      <TableCell>{grn.items}</TableCell>
                      <TableCell>Ksh {grn.value.toLocaleString()}</TableCell>
                      <TableCell>{grn.receivedDate}</TableCell>
                      <TableCell><Badge variant={statusColor(grn.status)}>{grn.status}</Badge></TableCell>
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
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
