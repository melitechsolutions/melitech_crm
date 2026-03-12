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
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";

export default function ContractManagement() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("contracts:view");
  const [searchQuery, setSearchQuery] = useState("");
  const [contracts] = useState([
    { id: "1", name: "Service Agreement", vendor: "Tech Corp", startDate: "2025-01-15", endDate: "2026-01-15", value: 50000, status: "active" },
    { id: "2", name: "Supply Contract", vendor: "Global Supplies", startDate: "2024-06-01", endDate: "2025-12-31", value: 75000, status: "active" },
    { id: "3", name: "Maintenance Agreement", vendor: "Service Pro", startDate: "2024-01-01", endDate: "2024-12-31", value: 25000, status: "expired" },
  ]);

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  const filteredContracts = contracts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => {
    return status === "active" ? "default" : status === "pending" ? "secondary" : "destructive";
  };

  return (
    <ModuleLayout
      title="Contracts Management"
      description="Manage contracts, agreements, and vendor terms"
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Contracts" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Contracts</h2>
            <p className="text-sm text-muted-foreground">Manage all contracts and agreements</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> New Contract</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contracts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
            <CardDescription>{filteredContracts.length} contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell>{contract.vendor}</TableCell>
                      <TableCell className="text-sm">{contract.startDate} to {contract.endDate}</TableCell>
                      <TableCell>Ksh {contract.value.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColor(contract.status)}>{contract.status}</Badge></TableCell>
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
