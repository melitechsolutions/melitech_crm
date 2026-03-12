import DashboardLayout from "@/components/DashboardLayout";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DocumentForm from "@/components/forms/DocumentForm";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CreateEstimate() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [estimateNumber, setEstimateNumber] = useState<string>("");
  const [isLoadingNumber, setIsLoadingNumber] = useState(true);
  const getNextNumberMutation = trpc.settings.getNextDocumentNumber.useMutation();

  // Generate estimate number on component mount
  useEffect(() => {
    let isMounted = true;

    const generateNumber = () => {
      setIsLoadingNumber(true);
      getNextNumberMutation.mutate(
        { documentType: 'estimate' },
        {
          onSuccess: (result) => {
            if (isMounted) setEstimateNumber(result.documentNumber || `EST-${String(Math.random() * 1000000 | 0).padStart(6, '0')}`);
          },
          onError: () => {
            if (isMounted) {
              console.error('Failed to generate estimate number');
              setEstimateNumber(`EST-${String(Math.random() * 1000000 | 0).padStart(6, '0')}`);
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

  const createEstimateMutation = trpc.estimates.create.useMutation({
    onSuccess: (data) => {
      toast.success("Estimate created successfully!");
      utils.estimates.list.invalidate();
      setLocation("/estimates");
    },
    onError: (error) => {
      toast.error(`Failed to create estimate: ${error.message}`);
    },
  });

  const handleSave = useCallback((data: any) => {
    if (!data.documentNumber) {
      toast.error("Estimate number is required");
      return;
    }

    const subtotal = data.subtotal || 0;
    const taxAmount = data.vat || 0;
    const total = data.grandTotal || (subtotal + taxAmount);

    const estimateData = {
      estimateNumber: data.documentNumber,
      clientId: data.clientId || `guest_${Date.now()}`,
      title: data.clientName ? `Quotation for ${data.clientName}` : undefined,
      issueDate: new Date(data.date),
      expiryDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      discountAmount: 0,
      total: Math.round(total * 100),
      status: (data.status || "draft") as "draft" | "sent" | "accepted" | "rejected" | "expired",
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
    
    createEstimateMutation.mutate(estimateData);
  }, [createEstimateMutation]);

  const handleSend = useCallback((data: any) => {
    if (!data.documentNumber) {
      toast.error("Estimate number is required");
      return;
    }

    if (!data.clientEmail) {
      toast.error("Client email is required to send estimate");
      return;
    }

    const subtotal = data.subtotal || 0;
    const taxAmount = data.vat || 0;
    const total = data.grandTotal || (subtotal + taxAmount);

    const estimateData = {
      estimateNumber: data.documentNumber,
      clientId: data.clientId || `guest_${Date.now()}`,
      title: data.clientName ? `Quotation for ${data.clientName}` : undefined,
      issueDate: new Date(data.date),
      expiryDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      discountAmount: 0,
      total: Math.round(total * 100),
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
    
    createEstimateMutation.mutate(estimateData);
    toast.info(`Estimate will be sent to ${data.clientEmail}`);
  }, [createEstimateMutation]);

  const defaultTerms = `1. All prices are in Kenya shillings (KSHs)
2. VAT is charged where applicable.
3. Quotation is valid for 45 days from date of generation.
4. Payment of 75% is expected before commencement of the project.`;

  const defaultPaymentDetails = `Bank: Kenya Commercial Bank
Branch: Kitengela
Acc.: 1295660644
Acc. Name: Melitech Solutions

or

Mpesa Paybill: 522522
Acc. Number: 1295660644`;

  const initialData = useMemo(() => ({ 
    documentNumber: estimateNumber,
    terms: defaultTerms,
    paymentDetails: defaultPaymentDetails
  }), [estimateNumber, defaultTerms, defaultPaymentDetails]);

  return (
    <DashboardLayout>
      <DocumentForm 
        type="estimate"
        mode="create"
        initialData={initialData}
        onSave={handleSave}
        onSend={handleSend}
        isLoading={isLoadingNumber}
        isSaving={createEstimateMutation.isPending}
      />
    </DashboardLayout>
  );
}
