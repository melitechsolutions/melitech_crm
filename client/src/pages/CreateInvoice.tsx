import DashboardLayout from "@/components/DashboardLayout";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DocumentForm from "@/components/forms/DocumentForm";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CreateInvoice() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:invoices:create");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [isLoadingNumber, setIsLoadingNumber] = useState(true);
  const getNextNumberMutation = trpc.settings.getNextDocumentNumber.useMutation();

  // Generate invoice number on component mount
  useEffect(() => {
    let isMounted = true;

    const generateNumber = () => {
      setIsLoadingNumber(true);
      getNextNumberMutation.mutate(
        { documentType: 'invoice' },
        {
          onSuccess: (result) => {
            if (isMounted) setInvoiceNumber(result.documentNumber || `INV-${String(Math.random() * 1000000 | 0).padStart(6, '0')}`);
          },
          onError: () => {
            if (isMounted) {
              console.error('Failed to generate invoice number');
              setInvoiceNumber(`INV-${String(Math.random() * 1000000 | 0).padStart(6, '0')}`);
            }
          },
          onSettled: () => {
            if (isMounted) setIsLoadingNumber(false);
          },
        }
      );
    };

    generateNumber();

    return () => {
      isMounted = false;
    };
  }, []);

  const createInvoiceMutation = trpc.invoices.create.useMutation({
    onSuccess: (data) => {
      toast.success("Invoice created successfully!");
      utils.invoices.list.invalidate();
      // Ensure path is correct for redirection
      setLocation("/invoices");
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });

  const handleSave = useCallback((data: any) => {
    if (!data.documentNumber) {
      toast.error("Invoice number is required");
      return;
    }

    const subtotal = data.subtotal || 0;
    const taxAmount = data.vat || 0;
    const total = data.grandTotal || (subtotal + taxAmount);

    const invoiceData = {
      invoiceNumber: data.documentNumber,
      clientId: data.clientId || `guest_${Date.now()}`,
      title: data.clientName ? `Invoice for ${data.clientName}` : undefined,
      issueDate: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      discountAmount: 0,
      total: Math.round(total * 100),
      paidAmount: 0,
      status: (data.status || "draft") as "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled",
      notes: data.notes || "",
      terms: data.terms || "",
      lineItems: data.lineItems?.map((item: any) => ({
        itemType: 'custom' as const,
        description: item.description,
        quantity: item.qty,
        unitPrice: Math.round(item.unitPrice * 100),
        taxRate: item.tax || 0,
        discountPercent: 0,
        total: Math.round(item.total * 100),
      })),
    };
    
    createInvoiceMutation.mutate(invoiceData);
  }, [createInvoiceMutation]);

  const handleSend = useCallback((data: any) => {
    if (!data.documentNumber) {
      toast.error("Invoice number is required");
      return;
    }

    if (!data.clientEmail) {
      toast.error("Client email is required to send invoice");
      return;
    }

    const subtotal = data.subtotal || 0;
    const taxAmount = data.vat || 0;
    const total = data.grandTotal || (subtotal + taxAmount);

    const invoiceData = {
      invoiceNumber: data.documentNumber,
      clientId: data.clientId || `guest_${Date.now()}`,
      title: data.clientName ? `Invoice for ${data.clientName}` : undefined,
      issueDate: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      discountAmount: 0,
      total: Math.round(total * 100),
      paidAmount: 0,
      status: "sent" as const,
      notes: data.notes || "",
      terms: data.terms || "",
      lineItems: data.lineItems?.map((item: any) => ({
        itemType: 'custom' as const,
        description: item.description,
        quantity: item.qty,
        unitPrice: Math.round(item.unitPrice * 100),
        taxRate: item.tax || 0,
        discountPercent: 0,
        total: Math.round(item.total * 100),
      })),
    };
    
    createInvoiceMutation.mutate(invoiceData);
    toast.info(`Invoice will be sent to ${data.clientEmail}`);
  }, [createInvoiceMutation]);

  const defaultTerms = `1. All prices are in Kenya shillings (KSHs)
2. VAT is charged where applicable.
3. Invoice is valid for 7 days from date of generation.
4. Late invoices will attract a penalty or suspension of service.`;

  const defaultPaymentDetails = `Bank: Kenya Commercial Bank
Branch: Kitengela
Acc.: 1295660644
Acc. Name: Melitech Solutions

or

Mpesa Paybill: 522522
Acc. Number: 1295660644`;

  const initialData = useMemo(() => ({ 
    documentNumber: invoiceNumber,
    terms: defaultTerms,
    paymentDetails: defaultPaymentDetails
  }), [invoiceNumber, defaultTerms, defaultPaymentDetails]);

  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <DashboardLayout>
      <DocumentForm 
        type="invoice"
        mode="create"
        initialData={initialData}
        onSave={handleSave}
        onSend={handleSend}
        isLoading={isLoadingNumber}
        isSaving={createInvoiceMutation.isPending}
      />
    </DashboardLayout>
  );
}
