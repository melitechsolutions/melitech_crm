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
import { Package, Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";

export default function DeliveryNotes() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("delivery_notes:view");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch delivery notes from backend
  const { data: notesData, isLoading: dataLoading } = trpc.deliveryNotes.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: allowed }
  );

  const deliveryNotes = notesData?.data || [];

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  const filteredNotes = deliveryNotes.filter(d =>
    d.dnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "delivered") return "default";
    if (status === "partial") return "secondary";
    return "outline";
  };

  return (
    <ModuleLayout
      title="Delivery Notes"
      description="Track incoming shipments and deliveries"
      icon={<Package className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Procurement", href: "/procurement" },
        { label: "Delivery Notes" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Delivery Notes</h2>
            <p className="text-sm text-muted-foreground">Track and manage incoming deliveries</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> New Delivery Note</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search delivery notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Records</CardTitle>
            <CardDescription>{filteredNotes.length} delivery notes</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-32"><Spinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DN #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Order Reference</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map(dn => (
                      <TableRow key={dn.id}>
                        <TableCell className="font-medium">{dn.dnNo}</TableCell>
                        <TableCell>{dn.supplier}</TableCell>
                        <TableCell>{dn.orderId}</TableCell>
                        <TableCell>{dn.items}</TableCell>
                        <TableCell>{dn.deliveryDate}</TableCell>
                        <TableCell><Badge variant={statusColor(dn.status)}>{dn.status}</Badge></TableCell>
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
