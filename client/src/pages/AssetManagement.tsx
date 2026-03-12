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

export default function AssetManagement() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("assets:view");
  const [searchQuery, setSearchQuery] = useState("");
  const [assets] = useState([
    { id: "1", name: "Dell Laptop", category: "IT Equipment", location: "Office A", value: 85000, status: "active", assignedTo: "John Doe" },
    { id: "2", name: "Server Unit", category: "IT Equipment", location: "Server Room", value: 350000, status: "active", assignedTo: "IT Department" },
    { id: "3", name: "Office Desk", category: "Furniture", location: "Office B", value: 15000, status: "active", assignedTo: "Jane Smith" },
  ]);

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModuleLayout
      title="Asset Management"
      description="Track and manage company assets"
      icon={<Package className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Assets" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Assets</h2>
            <p className="text-sm text-muted-foreground">Manage company assets and equipment</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> Register Asset</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Asset Inventory</CardTitle>
            <CardDescription>{filteredAssets.length} assets registered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>{asset.assignedTo}</TableCell>
                      <TableCell>Ksh {asset.value.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="default">{asset.status}</Badge></TableCell>
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
