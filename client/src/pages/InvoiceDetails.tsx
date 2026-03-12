import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import DashboardLayout from "@/components/DashboardLayout";
import PaymentTracking from "@/components/PaymentTracking";
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
  Download,
  Send,
  Edit,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Check,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import mutateAsync from '@/lib/mutationHelpers';
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import { APP_TITLE } from "@/const";

export default function InvoiceDetails() {
  const [, params] = useRoute("/invoices/:id");
  const [, navigate] = useLocation();
  const invoiceId = params?.id || "";
  const utils = trpc.useUtils();
  const { user } = useAuthWithPersistence();

  const { data: invoiceData, isLoading } = trpc.invoices.getWithItems.useQuery(invoiceId, {
    enabled: !!invoiceId,
  });
  const { data: clientsData = [] } = trpc.clients.list.useQuery();
  const { data: rawCompanyInfo } = trpc.settings.getCompanyInfo.useQuery();

  // Convert frozen Drizzle objects to plain objects to avoid React error #306
  const clientsDataPlain = clientsData ? JSON.parse(JSON.stringify(clientsData)) : [];
  const invoiceDataPlain = invoiceData ? JSON.parse(JSON.stringify(invoiceData)) : null;
  const companyInfo = rawCompanyInfo ? JSON.parse(JSON.stringify(rawCompanyInfo)) : null;

  const approveMutation = trpc.approvals.approveInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice approved successfully");
      utils.invoices.getWithItems.invalidate(invoiceId);
    },
    onError: (err) => toast.error(err.message),
  });

  const client = invoiceDataPlain ? (clientsDataPlain as any[]).find((c: any) => c.id === (invoiceDataPlain as any).clientId) : null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      utils.invoices.list.invalidate();
      navigate("/invoices");
    },
    onError: (err) => toast.error(err.message || "Failed to delete invoice"),
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteMutation, invoiceId);
    } catch (error) {
      // handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const invoice = invoiceDataPlain ? {
    id: invoiceId,
    invoiceNumber: (invoiceDataPlain as any).invoiceNumber || `INV-${invoiceId.slice(0, 8)}`,
    status: (invoiceDataPlain as any).status || "draft",
    issueDate: (invoiceDataPlain as any).issueDate ? new Date((invoiceDataPlain as any).issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: (invoiceDataPlain as any).dueDate ? new Date((invoiceDataPlain as any).dueDate).toISOString().split('T')[0] : "",
    paidDate: (invoiceDataPlain as any).paidDate ? new Date((invoiceDataPlain as any).paidDate).toISOString().split('T')[0] : "",
    client: {
      name: client?.companyName || "Unknown Client",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
    },
    items: (invoiceDataPlain as any).lineItems || (invoiceDataPlain as any).items || [],
    subtotal: ((invoiceDataPlain as any).subtotal || 0) / 100,
    tax: ((invoiceDataPlain as any).taxAmount || 0) / 100,
    total: ((invoiceDataPlain as any).total || 0) / 100,
    notes: (invoiceDataPlain as any).notes || "",
  } : null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateDocumentHTML({
      documentType: 'invoice',
      documentNumber: invoice?.invoiceNumber || 'N/A',
      documentDate: invoice?.issueDate || 'N/A',
      dueDate: invoice?.dueDate,
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: invoice?.client?.name || 'Client',
      clientEmail: invoice?.client?.email || 'Email',
      clientPhone: invoice?.client?.phone || 'Phone',
      clientAddress: invoice?.client?.address || 'Address',
      items: Array.isArray(invoice?.items) ? invoice.items.map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: (item.unitPrice || 0) / 100,
        total: (item.total || 0) / 100,
      })) : [],
      subtotal: (invoice?.subtotal || 0),
      tax: (invoice?.tax || 0),
      total: (invoice?.total || 0),
      taxType: (invoice as any)?.taxType || 'exclusive',
      notes: invoice?.notes,
      termsAndConditions: (invoice as any)?.termsAndConditions || 'Standard payment terms apply.',
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
  if (!invoice) return <DashboardLayout><div className="p-8 text-center">Not found</div></DashboardLayout>;

  const canApprove = (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'accountant') && invoice.status === 'draft';

  return (
    <>
      <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}><ArrowLeft className="h-4 w-4" /></Button>
            <div><h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1><p className="text-muted-foreground">Invoice for {invoice.client.name}</p></div>
          </div>
          <div className="flex gap-2">
            {canApprove && <Button onClick={() => approveMutation.mutate({ id: invoice.id })}><Check className="mr-2 h-4 w-4" />Approve</Button>}
            <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => navigate(`/invoices/${invoiceId}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          </div>
        </div>
        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>Invoice Details</CardTitle><Badge>{invoice?.status?.toUpperCase() || "PENDING"}</Badge></div></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-sm font-medium text-muted-foreground">Bill To</p><p className="font-semibold">{invoice?.client?.name || "Client"}</p><p className="text-sm">{invoice?.client?.address || "Address"}</p></div>
              <div className="text-right"><p className="text-sm"><strong>Date:</strong> {invoice?.issueDate || "N/A"}</p><p className="text-sm"><strong>Due:</strong> {invoice?.dueDate || "N/A"}</p></div>
            </div>
            <Separator />
            <Table>
              <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {Array.isArray(invoice?.items) && invoice.items.map((item: any, i: number) => (
                  <TableRow key={item.id || `inv-item-${i}`}><TableCell>{item?.description || "N/A"}</TableCell><TableCell className="text-right">{item?.quantity || 0}</TableCell><TableCell className="text-right">KES {((item?.unitPrice || 0)/100).toLocaleString()}</TableCell><TableCell className="text-right">KES {((item?.total || 0)/100).toLocaleString()}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end"><div className="w-64 space-y-2"><div className="flex justify-between"><span>Subtotal:</span><span>KES {(invoice?.subtotal || 0).toLocaleString()}</span></div><div className="flex justify-between"><span>Tax:</span><span>KES {(invoice?.tax || 0).toLocaleString()}</span></div><Separator /><div className="flex justify-between font-bold"><span>Total:</span><span>KES {(invoice?.total || 0).toLocaleString()}</span></div></div></div>
          </CardContent>
        </Card>

        {/* Payment Tracking Section */}
        <PaymentTracking 
          invoiceId={invoiceId}
          invoiceTotal={Math.round(invoice.total * 100)}
          invoiceStatus={invoice.status}
        />
      </div>
      </DashboardLayout>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
      />
    </>
  );
}
