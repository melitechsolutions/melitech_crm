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
  MapPin,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";
import { useState } from "react";
import { handleDelete as actionsHandleDelete, handleDownload as actionsHandleDownload, handleEmail as actionsHandleEmail } from "@/lib/actions";

export default function ReceiptDetails() {
  const [, params] = useRoute("/receipts/:id");
  const [, navigate] = useLocation();
  const receiptId = params?.id || "";
  const [kraPIN, setKraPIN] = useState("");

  // Fetch receipt from backend
  const { data: receiptData, isLoading } = trpc.receipts.getById.useQuery(receiptId);
  const { data: lineItemsData = [] } = trpc.lineItems.getByDocumentId.useQuery({ documentId: receiptId, documentType: 'receipt' });
  const { data: clientsData = [] } = trpc.clients.list.useQuery();
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery();

  // Get client info
  const client = receiptData ? (clientsData as any[]).find((c: any) => c.id === (receiptData as any).clientId) : null;

  const receipt = receiptData ? {
    id: receiptId,
    receiptNumber: (receiptData as any).receiptNumber || `REC-${receiptId.slice(0, 8)}`,
    status: (receiptData as any).status || "draft",
    issueDate: (receiptData as any).issueDate ? new Date((receiptData as any).issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: (receiptData as any).paymentMethod || "Unknown",
    referenceNumber: (receiptData as any).referenceNumber || "",
    client: {
      name: client?.companyName || "Unknown Client",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
    },
    project: (receiptData as any).projectId || "",
    items: lineItemsData && lineItemsData.length > 0 
      ? lineItemsData 
      : (receiptData as any).items || [],
    subtotal: ((receiptData as any).subtotal || 0) / 100,
    tax: ((receiptData as any).tax || 0) / 100,
    discount: 0,
    total: ((receiptData as any).total || 0) / 100,
    notes: (receiptData as any).notes || "",
  } : null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "received":
        return "default";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      case "draft":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <CheckCircle2 className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "failed":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleDownload = () => actionsHandleDownload(receiptId, "receipt", "pdf", receipt);
  const handleEmail = () => actionsHandleEmail(receiptId, "receipt", receipt?.client?.email || "", receipt);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateDocumentHTML({
      documentType: 'receipt',
      documentNumber: receipt?.receiptNumber || 'N/A',
      documentDate: receipt?.issueDate || 'N/A',
      kraPIN: kraPIN,
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: receipt?.client?.name || 'Client',
      clientEmail: receipt?.client?.email || 'Email',
      clientPhone: receipt?.client?.phone || 'Phone',
      clientAddress: receipt?.client?.address || 'Address',
      items: Array.isArray(receipt?.items) ? receipt.items.map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: (item.unitPrice || 0) / 100,
        total: (item.total || 0) / 100,
      })) : [],
      subtotal: (receipt?.subtotal || 0),
      tax: (receipt?.tax || 0),
      total: (receipt?.total || 0),
      taxType: (receipt as any)?.taxType || 'exclusive',
      paymentMethod: receipt?.paymentMethod,
      referenceNumber: receipt?.referenceNumber,
      notes: receipt?.notes,
      termsAndConditions: (receipt as any)?.termsAndConditions || 'Thank you for your payment.',
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.receipts.delete.useMutation({
    onSuccess: () => {
      toast.success("Receipt deleted successfully");
      utils.receipts.list.invalidate();
      navigate("/receipts");
    },
    onError: (err) => toast.error(err.message || "Failed to delete receipt"),
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await mutateAsync(deleteMutation, receiptId);
    } catch (error) {
      // handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading receipt...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!receipt) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Receipt not found</p>
          <Button onClick={() => navigate("/receipts")}>Back to Receipts</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
      <div className="print-area space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/receipts")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{receipt.receiptNumber}</h1>
              <p className="text-muted-foreground">Receipt for {receipt.client.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleEmail}>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button onClick={() => navigate(`/receipts/${receiptId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Receipt
            </Button>
            <Button variant="destructive" onClick={() => actionsHandleDelete(receiptId, "receipt", () => mutateAsync(deleteMutation, receiptId))}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Receipt Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Receipt Details</CardTitle>
                <CardDescription>Complete receipt information and payment details</CardDescription>
              </div>
              <Badge variant={getStatusVariant(receipt?.status || "pending")} className="gap-1 px-3 py-2">
                {getStatusIcon(receipt?.status || "pending")}
                {receipt?.status?.toUpperCase() || "PENDING"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KRA PIN Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">KRA PIN</label>
              <input
                type="text"
                placeholder="Enter KRA PIN"
                value={kraPIN}
                onChange={(e) => setKraPIN(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Company & Client Info */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* From */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">FROM</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Melitech Solutions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    info@melitechsolutions.co.ke
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    +254 700 000 000
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Nairobi, Kenya
                  </div>
                </div>
              </div>

              {/* To */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">RECEIVED FROM</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{receipt?.client?.name || "Client"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {receipt?.client?.email || "No email"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {receipt?.client?.phone || "No phone"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {receipt?.client?.address || "No address"}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Receipt Meta */}
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receipt Number</p>
                <p className="text-sm font-semibold">{receipt?.receiptNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receipt Date</p>
                <p className="text-sm font-semibold">{receipt?.issueDate ? new Date(receipt.issueDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-sm font-semibold">{receipt?.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                <p className="text-sm font-semibold">{receipt.referenceNumber || "N/A"}</p>
              </div>
            </div>

            <Separator />

            {/* Line Items */}
            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(receipt?.items) && receipt.items.length > 0 ? (
                    receipt.items.map((item: any, index: number) => (
                      <TableRow key={item.id || `item-${index}`}>
                        <TableCell>{item?.description || "N/A"}</TableCell>
                        <TableCell className="text-right">{item?.quantity || 0}</TableCell>
                        <TableCell className="text-right">KES {((item?.rate || 0) / 100).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">
                          KES {((item?.amount || 0) / 100).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No items
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">KES {(receipt?.subtotal || 0).toLocaleString()}</span>
                </div>
                {(receipt?.tax || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (16% VAT)</span>
                    <span className="font-medium">KES {(receipt?.tax || 0).toLocaleString()}</span>
                  </div>
                )}
                {(receipt?.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">
                      -KES {(receipt?.discount || 0).toLocaleString()}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount Received</span>
                  <span>KES {(receipt?.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {receipt?.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{receipt?.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      </DashboardLayout>
    </>
  );
}

