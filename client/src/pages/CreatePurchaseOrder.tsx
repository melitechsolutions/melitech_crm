import React, { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ProcurementFormComponent } from "@/components/ProcurementFormComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface PurchaseOrderData {
  documentNumber: string;
  supplier: string;
  supplierContact: string;
  deliveryAddress: string;
  deliveryDate: string;
  notes: string;
  lineItems: Array<{
    itemNumber: string;
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    discountPercent: number;
    amount: number;
  }>;
}

export default function CreatePurchaseOrder() {
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submittedData, setSubmittedData] = useState<PurchaseOrderData | null>(null);

  const handleSubmit = (formData: PurchaseOrderData) => {
    try {
      // Validate required fields
      if (!formData.supplier) {
        throw new Error("Supplier is required");
      }
      if (!formData.deliveryAddress) {
        throw new Error("Delivery address is required");
      }
      if (!formData.deliveryDate) {
        throw new Error("Delivery date is required");
      }
      if (formData.lineItems.length === 0) {
        throw new Error("At least one line item is required");
      }

      // Validate all line items have required fields
      formData.lineItems.forEach((item, idx) => {
        if (!item.itemName) throw new Error(`Line item ${idx + 1}: Item name is required`);
        if (item.quantity <= 0) throw new Error(`Line item ${idx + 1}: Quantity must be greater than 0`);
        if (item.unitPrice <= 0) throw new Error(`Line item ${idx + 1}: Unit price must be greater than 0`);
      });

      // Simulate API call
      console.log("Purchase Order Data:", formData);
      
      // Auto-generate document number if empty
      const poData = {
        ...formData,
        documentNumber: formData.documentNumber || `PO-${Date.now()}`,
      };

      setSubmittedData(poData);
      setSubmitStatus("success");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Purchase Order Submission Error:", error);
      setSubmitStatus("error");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    }
  };

  return (
    <ModuleLayout
      title="Create Purchase Order"
      breadcrumbs={[
        { label: "Procurement", href: "/procurement" },
        { label: "Purchase Orders", href: "/purchase-orders" },
        { label: "Create", href: "/create-purchase-order" },
      ]}
    >
      <div className="space-y-6">
        {/* Status Messages */}
        {submitStatus === "success" && (
          <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 flex gap-3 items-start">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Purchase Order Created Successfully
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Document Number: {submittedData?.documentNumber}
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Total Amount: {submittedData?.lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {submitStatus === "error" && (
          <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
            <CardContent className="pt-6 flex gap-3 items-start">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Error Creating Purchase Order
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  Please check the form for errors and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Purchase Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              A Purchase Order (PO) is a formal document used to request and purchase goods or
              services from suppliers. It establishes the terms of purchase and creates a binding
              agreement.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Required Fields:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Supplier/Vendor name</li>
                <li>Delivery address</li>
                <li>Delivery date</li>
                <li>At least one line item with item name, quantity, and unit price</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Optional Fields:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Contact person for the supplier</li>
                <li>Item descriptions and specifications</li>
                <li>Discount percentages per item</li>
                <li>Special terms, payment conditions, or delivery notes</li>
              </ul>
            </div>
            <div className="space-y-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">ℹ️ Key Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>PO number is auto-generated and serves as reference for all transactions</li>
                <li>Discounts are calculated automatically on a per-item basis</li>
                <li>Total amounts update in real-time as you enter data</li>
                <li>All prices should be in the organization's standard currency</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <ProcurementFormComponent
          title="Purchase Order (PO)"
          type="purchase-order"
          onSubmit={handleSubmit}
        />

        {/* Process Flow Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Purchase Order Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div className="w-1 h-8 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Create PO</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fill in supplier details and line items
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div className="w-1 h-8 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Submit for Approval</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send PO to authorized approvers
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div className="w-1 h-8 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">PO Approved</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PO number is generated and sent to supplier
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div className="w-1 h-8 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Delivery & Invoice</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Goods delivered and matched with invoice
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                    ✓
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Payment & Closure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment processed and PO closed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Always verify supplier details before creating PO</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Include detailed item descriptions to avoid confusion</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Ensure reasonable delivery dates with supplier capacity</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Confirm unit prices are in the correct currency</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Keep special terms clear in the notes section</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
