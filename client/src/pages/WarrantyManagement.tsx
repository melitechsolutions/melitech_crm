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
import { Shield, Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";

export default function WarrantyManagement() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("warranty:view");
  const [searchQuery, setSearchQuery] = useState("");
  const [warranties] = useState([
    { id: "1", product: "Dell Laptop", vendor: "Dell", expiryDate: "2026-01-15", coverage: "Hardware", status: "active" },
    { id: "2", product: "Server Unit", vendor: "HP", expiryDate: "2027-06-01", coverage: "Full Coverage", status: "active" },
    { id: "3", product: "Printer", vendor: "Canon", expiryDate: "2025-03-31", coverage: "Parts & Labor", status: "expiring_soon" },
  ]);

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  const filteredWarranties = warranties.filter(w =>
    w.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => {
    return status === "active" ? "default" : status === "expiring_soon" ? "secondary" : "destructive";
  };

  return (
    <ModuleLayout
      title="Warranty Management"
      description="Track product warranties and coverage"
      icon={<Shield className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Warranties" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Warranties</h2>
            <p className="text-sm text-muted-foreground">Manage product warranties and coverage</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Warranty</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search warranties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warranty Registry</CardTitle>
            <CardDescription>{filteredWarranties.length} warranties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarranties.map(warranty => (
                    <TableRow key={warranty.id}>
                      <TableCell className="font-medium">{warranty.product}</TableCell>
                      <TableCell>{warranty.vendor}</TableCell>
                      <TableCell>{warranty.coverage}</TableCell>
                      <TableCell>{warranty.expiryDate}</TableCell>
                      <TableCell><Badge variant={statusColor(warranty.status)}>{warranty.status}</Badge></TableCell>
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
