import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Printer,
  Check,
  Trash2,
} from "lucide-react";
import { handleDelete } from "@/lib/actions";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { APP_TITLE } from "@/const";

export default function EstimateDetails() {
  const [, params] = useRoute("/estimates/:id");
  const [, navigate] = useLocation();
  const estimateId = params?.id || "";
  const utils = trpc.useUtils();
  const { user } = useAuthWithPersistence();

  const { data: estimateData, isLoading } = trpc.estimates.getWithItems.useQuery(estimateId);
  const { data: clientsData = [] } = trpc.clients.list.useQuery();
  const { data: rawCompanyInfo } = trpc.settings.getCompanyInfo.useQuery();

  // Convert frozen Drizzle objects to plain objects to avoid React error #306
  const clientsDataPlain = clientsData ? JSON.parse(JSON.stringify(clientsData)) : [];
  const estimateDataPlain = estimateData ? JSON.parse(JSON.stringify(estimateData)) : null;
  const companyInfo = rawCompanyInfo ? JSON.parse(JSON.stringify(rawCompanyInfo)) : null;

  const approveMutation = trpc.approvals.approveEstimate.useMutation({
    onSuccess: () => {
      toast.success("Estimate approved successfully");
      utils.estimates.getWithItems.invalidate(estimateId);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.estimates.delete.useMutation({
    onSuccess: () => {
      toast.success("Estimate deleted successfully");
      utils.estimates.list.invalidate();
      navigate("/estimates");
    },
    onError: (err) => toast.error(err?.message || "Failed to delete estimate"),
  });

  const client = estimateDataPlain ? (clientsDataPlain as any[]).find((c: any) => c.id === (estimateDataPlain as any).clientId) : null;

  const estimate = estimateDataPlain ? {
    id: estimateId,
    estimateNumber: (estimateDataPlain as any).estimateNumber || `EST-${estimateId.slice(0, 8)}`,
    status: (estimateDataPlain as any).status || "draft",
    issueDate: (estimateDataPlain as any).issueDate ? new Date((estimateDataPlain as any).issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    client: {
      name: client?.companyName || "Unknown Client",
      email: client?.email || "",
      address: client?.address || "",
    },
    items: (estimateDataPlain as any).lineItems || (estimateDataPlain as any).items || [],
    subtotal: ((estimateDataPlain as any).subtotal || 0) / 100,
    tax: ((estimateDataPlain as any).taxAmount || 0) / 100,
    total: ((estimateDataPlain as any).total || 0) / 100,
  } : null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateDocumentHTML({
      documentType: 'estimate',
      documentNumber: estimate?.estimateNumber || 'N/A',
      documentDate: estimate?.issueDate || 'N/A',
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: estimate?.client?.name || 'Client',
      clientEmail: estimate?.client?.email || 'Email',
      clientPhone: estimate?.client?.phone || 'Phone',
      clientAddress: estimate?.client?.address || 'Address',
      items: Array.isArray(estimate?.items) ? estimate.items.map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: (item.unitPrice || 0) / 100,
        total: (item.total || 0) / 100,
      })) : [],
      subtotal: (estimate?.subtotal || 0),
      tax: (estimate?.tax || 0),
      total: (estimate?.total || 0),
      taxType: (estimate as any)?.taxType || 'exclusive',
      notes: estimate?.notes,
      termsAndConditions: (estimate as any)?.termsAndConditions || 'Valid for 30 days from date of issuance.',
      bankName: 'Kenya Commercial Bank',
      bankBranch: 'Kitengela',
      bankAccount: '1295660644',
      bankAccountName: 'Melitech Solutions',
      mpesaPaybill: '522522',
      mpesaAccountNumber: '1295660644',
    });

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) return <DashboardLayout><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (!estimate) return <DashboardLayout><div className="p-8 text-center">Not found</div></DashboardLayout>;

  const canApprove = (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'accountant') && estimate.status === 'draft';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/estimates")}><ArrowLeft className="h-4 w-4" /></Button>
            <div><h1 className="text-3xl font-bold">{estimate?.estimateNumber || "N/A"}</h1><p className="text-muted-foreground">Quotation for {estimate?.client?.name || "Client"}</p></div>
          </div>
          <div className="flex gap-2">
            {canApprove && <Button onClick={() => approveMutation.mutate({ id: estimate.id })}><Check className="mr-2 h-4 w-4" />Approve</Button>}
            <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => navigate(`/estimates/${estimateId}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
            <Button variant="destructive" onClick={() => handleDelete(estimateId, "estimate", () => mutateAsync(deleteMutation, estimateId))}>
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>Quotation Details</CardTitle><Badge>{estimate?.status?.toUpperCase() || "DRAFT"}</Badge></div></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-sm font-medium text-muted-foreground">Bill To</p><p className="font-semibold">{estimate?.client?.name || "Client"}</p><p className="text-sm">{estimate?.client?.address || "Address"}</p></div>
              <div className="text-right"><p className="text-sm"><strong>Date:</strong> {estimate?.issueDate || "N/A"}</p></div>
            </div>
            <Separator />
            <Table>
              <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {Array.isArray(estimate?.items) && estimate.items.map((item: any, i: number) => (
                  <TableRow key={item.id || `est-item-${i}`}><TableCell>{item?.description || "N/A"}</TableCell><TableCell className="text-right">{item?.quantity || 0}</TableCell><TableCell className="text-right">KES {((item?.unitPrice || 0)/100).toLocaleString()}</TableCell><TableCell className="text-right">KES {((item?.total || 0)/100).toLocaleString()}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end"><div className="w-64 space-y-2"><div className="flex justify-between"><span>Subtotal:</span><span>KES {((estimate.subtotal || 0)).toLocaleString()}</span></div><div className="flex justify-between"><span>Tax:</span><span>KES {((estimate.tax || 0)).toLocaleString()}</span></div><Separator /><div className="flex justify-between font-bold"><span>Total:</span><span>KES {((estimate.total || 0)).toLocaleString()}</span></div></div></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
