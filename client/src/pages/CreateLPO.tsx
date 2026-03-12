import React, { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ProcurementFormComponent } from "@/components/ProcurementFormComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface LPOData {
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

export default function CreateLPO() {
  const { allowed, isLoading } = useRequireFeature("procurement:lpo:create");
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submittedData, setSubmittedData] = useState<LPOData | null>(null);
  
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleSubmit = (formData: LPOData) => {
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
      console.log("LPO Data:", formData);
      
      // Auto-generate document number if empty
      const lpoData = {
        ...formData,
        documentNumber: formData.documentNumber || `LPO-${Date.now()}`,
      };

      setSubmittedData(lpoData);
      setSubmitStatus("success");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error("LPO Submission Error:", error);
      setSubmitStatus("error");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    }
  };

  return (
    <ModuleLayout
      title="Create Local Purchase Order"
      breadcrumbs={[
        { label: "Procurement", href: "/procurement" },
        { label: "LPOs", href: "/lpos" },
        { label: "Create", href: "/create-lpo" },
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
                  LPO Created Successfully
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
                  Error Creating LPO
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
              📋 Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              A Local Purchase Order (LPO) is used to request goods or services from local suppliers.
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
                <li>Item descriptions for clarity</li>
                <li>Discount percentages per item</li>
                <li>Special notes or instructions</li>
              </ul>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-3">
              💡 Tip: Discounts are automatically calculated and line amounts are updated in real-time.
            </p>
          </CardContent>
        </Card>

        {/* Main Form */}
        <ProcurementFormComponent
          title="Local Purchase Order (LPO)"
          type="lpo"
          onSubmit={handleSubmit}
        />

        {/* Reference Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">LPO Creation Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="h-4 w-4" />
                <span className="text-gray-700 dark:text-gray-300">Supplier details verified</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="h-4 w-4" />
                <span className="text-gray-700 dark:text-gray-300">Items with quantities and prices</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="h-4 w-4" />
                <span className="text-gray-700 dark:text-gray-300">Delivery address confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="h-4 w-4" />
                <span className="text-gray-700 dark:text-gray-300">Reasonable delivery date selected</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="h-4 w-4" />
                <span className="text-gray-700 dark:text-gray-300">Budget approval obtained</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
