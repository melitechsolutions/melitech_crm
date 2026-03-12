import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Send, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface LineItem {
  id: string;
  sno: number;
  description: string;
  uom: string;
  qty: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface DocumentFormProps {
  type: "invoice" | "estimate" | "receipt" | "payment";
  mode?: "create" | "edit";
  onSave?: (data: any) => void;
  onSend?: (data: any) => void;
  onDelete?: () => void;
  initialData?: any;
  isLoading?: boolean;
  isSaving?: boolean;
}

export default function DocumentForm({ 
  type, 
  mode = "create",
  onSave, 
  onSend, 
  initialData,
  isLoading = false,
  isSaving = false,
}: DocumentFormProps) {
  const [documentNumber, setDocumentNumber] = useState(initialData?.documentNumber || "");

  // Update document number when initialData changes (e.g. after async fetch)
  useEffect(() => {
    if (initialData?.documentNumber) {
      setDocumentNumber(initialData.documentNumber);
    }
  }, [initialData?.documentNumber]);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [clientId, setClientId] = useState(initialData?.clientId || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || "");
  const [clientAddress, setClientAddress] = useState(initialData?.clientAddress || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [terms, setTerms] = useState(initialData?.terms || "");
  const [paymentDetails, setPaymentDetails] = useState(initialData?.paymentDetails || "");
  const [applyVAT, setApplyVAT] = useState(initialData?.applyVAT ?? true);
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(initialData?.taxType || "exclusive");
  const [vatPercentage, setVatPercentage] = useState(initialData?.vatPercentage ?? 16);
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || "mpesa");
  const [lineItems, setLineItems] = useState<LineItem[]>(initialData?.lineItems || [
    { id: "1", sno: 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, total: 0 }
  ]);

  const { data: clientsData } = trpc.clients.list.useQuery();
  const clients = useMemo(() => clientsData || [], [clientsData]);
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery();
  const { data: bankDetails } = trpc.settings.getBankDetails.useQuery();

  useEffect(() => {
    if (clientId && clients.length > 0) {
      const selectedClient = clients.find((c: any) => c.id === clientId);
      if (selectedClient) {
        setClientName(selectedClient.companyName || "");
        setClientEmail(selectedClient.email || "");
        setClientAddress(selectedClient.address || "");
      }
    }
  }, [clientId, clients]);

  // Handle terms and payment details updates when company info or bank details load
  useEffect(() => {
    if (mode === 'create' && companyInfo && bankDetails) {
      if (!terms && initialData?.terms) {
        setTerms(initialData.terms);
      }
      if (!paymentDetails && initialData?.paymentDetails) {
        setPaymentDetails(initialData.paymentDetails);
      }
    }
  }, [mode, companyInfo, bankDetails, initialData?.terms, initialData?.paymentDetails]);

  const calculateLineTotal = useCallback((qty: number, unitPrice: number, taxPercent: number): number => {
    const subtotal = qty * unitPrice;
    const taxAmount = (subtotal * taxPercent) / 100;
    return subtotal + taxAmount;
  }, []);

  const { subtotal, vat, grandTotal } = useMemo(() => {
    const rawSubtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    
    let subtotal = rawSubtotal;
    let vat = 0;
    let grandTotal = rawSubtotal;

    if (applyVAT) {
      if (taxType === "inclusive") {
        // Grand total is the raw subtotal, VAT is extracted from it
        grandTotal = rawSubtotal;
        vat = rawSubtotal - (rawSubtotal / (1 + vatPercentage / 100));
        subtotal = grandTotal - vat;
      } else {
        // VAT is added on top of the subtotal
        subtotal = rawSubtotal;
        vat = (subtotal * vatPercentage) / 100;
        grandTotal = subtotal + vat;
      }
    }

    return { subtotal, vat, grandTotal };
  }, [lineItems, applyVAT, vatPercentage, taxType]);

  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, { id: Date.now().toString(), sno: prev.length + 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, total: 0 }]);
  }, []);

  const updateLineItem = useCallback((id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'unitPrice' || field === 'tax') {
          updatedItem.total = calculateLineTotal(updatedItem.qty, updatedItem.unitPrice, updatedItem.tax);
        }
        return updatedItem;
      }
      return item;
    }));
  }, [calculateLineTotal]);

  const getFormData = useCallback(() => ({
    id: initialData?.id, documentNumber, type, date, dueDate, clientId, clientName, clientEmail, clientAddress, lineItems, subtotal, vat, grandTotal, notes, terms, paymentDetails, applyVAT, taxType, vatPercentage, paymentMethod,
  }), [documentNumber, type, date, dueDate, clientId, clientName, clientEmail, clientAddress, lineItems, subtotal, vat, grandTotal, notes, terms, paymentDetails, applyVAT, taxType, vatPercentage, paymentMethod, initialData?.id]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }
    const title = type.toUpperCase();
    
    const logoHtml = companyInfo?.companyLogo 
      ? `<img src="${companyInfo.companyLogo}" style="max-height: 80px; margin-bottom: 15px;" />` 
      : `<div class="document-title">${title}</div>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} ${documentNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { max-width: 50%; }
            .document-title { font-size: 24px; font-weight: bold; color: #2563eb; }
            .doc-details { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; text-align: left; padding: 12px; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 8px; }
            .footer { margin-top: 60px; text-align: center; font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
            .terms-section { margin-top: 40px; }
            .section-title { font-weight: bold; margin-bottom: 8px; font-size: 0.95em; }
            .section-content { white-space: pre-wrap; font-size: 0.9em; color: #444; margin-bottom: 20px; }
            .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .column-box { border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              ${logoHtml}
              <p style="font-size: 0.9em; margin-top: 10px;">
                ${companyInfo?.companyAddress || 'Nairobi, Kenya'}<br>
                ${companyInfo?.companyCity || ''} ${companyInfo?.companyCountry || ''}<br>
                Email: ${companyInfo?.companyEmail || ''}<br>
                Phone: ${companyInfo?.companyPhone || ''}
              </p>
            </div>
            <div class="doc-details">
              <div class="document-title">${title}</div>
              <p><strong>Number:</strong> ${documentNumber}</p>
              <p><strong>Date:</strong> ${date}</p>
              ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ''}
            </div>
          </div>
          
          <div style="margin-bottom: 30px">
            <div class="section-title">Bill To:</div>
            <div class="section-content">${clientName}<br>${clientAddress}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">${item.qty}</td>
                  <td class="text-right">KES ${item.unitPrice.toLocaleString()}</td>
                  <td class="text-right">KES ${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>Subtotal:</span><span>KES ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            ${applyVAT ? `<div class="total-row"><span>VAT (${vatPercentage}%) ${taxType === 'inclusive' ? '(Incl.)' : '(Excl.)'}:</span><span>KES ${vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>` : ''}
            <div class="total-row grand-total"><span>Grand Total:</span><span>KES ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          </div>
          
          <div class="terms-section">
            <div class="two-column">
              <div class="column-box">
                <div class="section-title">Terms & Conditions:</div>
                <div class="section-content">${terms}</div>
              </div>
              <div class="column-box">
                <div class="section-title">Payment Details:</div>
                <div class="section-content">${paymentDetails}</div>
              </div>
            </div>
            
            ${notes ? `<div class="section-title">Notes:</div><div class="section-content">${notes}</div>` : ''}
          </div>
          
          <div class="footer">
            This is a system generated ${type} and is digitally signed under Melitech Solutions.
          </div>
          
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between mb-6">
          <div className="flex flex-col gap-2">
            {companyInfo?.companyLogo ? (
              <img src={companyInfo.companyLogo} alt="Logo" className="h-16 w-auto object-contain" />
            ) : (
              <h1 className="text-3xl font-bold text-primary">{type.toUpperCase()}</h1>
            )}
            {companyInfo?.companyLogo && <h1 className="text-xl font-bold text-primary">{type.toUpperCase()}</h1>}
          </div>
          <div className="text-right">
            <p className="font-bold">{companyInfo?.companyName || APP_TITLE}</p>
            <p className="text-sm text-muted-foreground">
              {companyInfo?.companyAddress || 'Nairobi, Kenya'}<br />
              {companyInfo?.companyPhone || ''}
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Number</Label>
              <Input 
                value={documentNumber} 
                readOnly 
                className="bg-gray-100 cursor-not-allowed font-mono" 
                placeholder="Generating..."
              />
            </div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            {type !== 'receipt' && <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>}
            {type === 'receipt' && <div><Label>Payment Method</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mpesa">M-Pesa</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem></SelectContent></Select></div>}
          </div>
          <div className="space-y-4">
            {type === 'receipt' ? (
              <>
                <div>
                  <Label>Client</Label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Select value={clientId} onValueChange={(value) => {
                        setClientId(value);
                        const selectedClient = clients.find((c: any) => c.id === value);
                        if (selectedClient) {
                          setClientName(selectedClient.companyName || "");
                          setClientEmail(selectedClient.email || "");
                          setClientAddress(selectedClient.address || "");
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select from existing clients" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.companyName || "Unknown Client"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Or enter details below</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Client Name / Walk-in Customer</Label>
                  <Input 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name or walk-in customer name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={clientEmail} 
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client email (optional)"
                  />
                </div>
              </>
            ) : (
              <div>
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName || "Unknown Client"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Address</Label><Textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} rows={2} /></div>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex justify-between mb-4"><h2 className="text-xl font-semibold">Items</h2><Button onClick={addLineItem} size="sm"><Plus className="h-4 w-4 mr-2" />Add Item</Button></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-muted"><th className="p-2 text-left">Description</th><th className="p-2 text-right w-24">Qty</th><th className="p-2 text-right w-32">Rate</th><th className="p-2 text-right w-32">Total</th><th className="p-2 w-16"></th></tr></thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 border"><Input value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} /></td>
                  <td className="p-2 border"><Input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value))} /></td>
                  <td className="p-2 border"><Input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, 'unitPrice', parseInt(e.target.value))} /></td>
                  <td className="p-2 border text-right">KES {item.total.toLocaleString()}</td>
                  <td className="p-2 border"><Button variant="ghost" size="icon" onClick={() => setLineItems(lineItems.filter(li => li.id !== item.id))}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <div className="w-80 space-y-4">
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <Label className="text-sm font-medium">Tax Type</Label>
              <div className="flex gap-2">
                <Button 
                  variant={taxType === "exclusive" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setTaxType("exclusive")}
                  className="h-8 text-xs"
                >
                  Exclusive
                </Button>
                <Button 
                  variant={taxType === "inclusive" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setTaxType("inclusive")}
                  className="h-8 text-xs"
                >
                  Inclusive
                </Button>
              </div>
            </div>
            <div className="space-y-2 px-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>KES {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {applyVAT && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>VAT ({vatPercentage}%) {taxType === 'inclusive' ? '(Incl.)' : '(Excl.)'}:</span>
                  <span>KES {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total:</span>
                <span>KES {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
          <Textarea 
            value={terms} 
            onChange={(e) => setTerms(e.target.value)} 
            rows={6} 
            placeholder="Enter terms and conditions..."
          />
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <Textarea 
            value={paymentDetails} 
            onChange={(e) => setPaymentDetails(e.target.value)} 
            rows={6} 
            placeholder="Enter payment details..."
          />
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <Textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows={3} 
          placeholder="Additional notes..."
        />
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
        <Button variant="outline" onClick={() => onSave?.({ ...getFormData(), status: 'draft' })}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
        <Button onClick={() => onSave?.(getFormData())} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save & Continue</Button>
      </div>
    </div>
  );
}
