import React, { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ImprestData {
  requestNumber: string;
  employeeName: string;
  employeeId: string;
  department: string;
  purpose: string;
  amount: number;
  requestDate: string;
  expectedReturnDate: string;
  approver: string;
  status: string;
  notes: string;
}

export default function CreateImprest() {
  const { allowed, isLoading } = useRequireFeature("procurement:imprest:create");
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submittedData, setSubmittedData] = useState<ImprestData | null>(null);
  const [formData, setFormData] = useState<ImprestData>({
    requestNumber: "",
    employeeName: "",
    employeeId: "",
    department: "",
    purpose: "",
    amount: 0,
    requestDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    approver: "",
    status: "pending",
    notes: "",
  });
  
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleChange = (field: keyof ImprestData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.employeeName) throw new Error("Employee name is required");
      if (!formData.employeeId) throw new Error("Employee ID is required");
      if (!formData.department) throw new Error("Department is required");
      if (!formData.purpose) throw new Error("Purpose is required");
      if (formData.amount <= 0) throw new Error("Amount must be greater than 0");
      if (!formData.expectedReturnDate) throw new Error("Expected return date is required");
      if (!formData.approver) throw new Error("Approver is required");

      // Validate date logic
      const requestDate = new Date(formData.requestDate);
      const returnDate = new Date(formData.expectedReturnDate);
      if (returnDate <= requestDate) {
        throw new Error("Expected return date must be after request date");
      }

      // Auto-generate request number
      const imprestData = {
        ...formData,
        requestNumber: formData.requestNumber || `IMP-${Date.now()}`,
      };

      console.log("Imprest Data:", imprestData);
      setSubmittedData(imprestData);
      setSubmitStatus("success");

      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Imprest Submission Error:", error);
      setSubmitStatus("error");

      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    }
  };

  const departments = [
    "Sales",
    "Accounting",
    "Human Resources",
    "Procurement",
    "Inventory",
    "Operations",
    "IT",
  ];

  return (
    <ModuleLayout
      title="Request Imprest Advance"
      breadcrumbs={[
        { label: "Finance", href: "/finance" },
        { label: "Imprests", href: "/imprests" },
        { label: "New Request", href: "/create-imprest" },
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
                  Imprest Request Submitted Successfully
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Request Number: {submittedData?.requestNumber}
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Employee: {submittedData?.employeeName} | Amount: {submittedData?.amount.toFixed(2)}
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
                  Error Submitting Request
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
              📋 Imprest Advance Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              An Imprest is a cash advance given to an employee for business expenses. This form
              initiates the imprest request process.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Process Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Submit imprest request with required details</li>
                <li>Manager reviews and approves/rejects</li>
                <li>Finance department processes approved requests</li>
                <li>Cash or bank transfer issued to employee</li>
                <li>Employee returns funds and submits receipts</li>
                <li>Accounting reconciles and closes imprest</li>
              </ol>
            </div>
            <div className="space-y-2 mt-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Important:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Imprests are typically for short-term advances (7-30 days)</li>
                <li>All receipts must be submitted upon return</li>
                <li>Unaccounted amounts may be recovered from employee payroll</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Request Number *
                </label>
                <Input
                  type="text"
                  value={formData.requestNumber}
                  onChange={(e) => handleChange("requestNumber", e.target.value)}
                  placeholder="Auto-generated"
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee ID *
                </label>
                <Input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange("employeeId", e.target.value)}
                  placeholder="e.g., EMP001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee Name *
                </label>
                <Input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => handleChange("employeeName", e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Request Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purpose of Imprest *
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                  placeholder="Describe what the imprest will be used for (e.g., Client site visit, office supplies, travel, etc.)"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount Required (KES) *
                  </label>
                  <Input
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Approver (Manager) *
                  </label>
                  <Input
                    type="text"
                    value={formData.approver}
                    onChange={(e) => handleChange("approver", e.target.value)}
                    placeholder="Manager name"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Request Date
                  </label>
                  <Input
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => handleChange("requestDate", e.target.value)}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Return Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.expectedReturnDate}
                    onChange={(e) => handleChange("expectedReturnDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any additional information or special instructions"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Before Submitting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="h-4 w-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Employee details are accurate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="h-4 w-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Clear description of purpose provided
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="h-4 w-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Amount is reasonable and justified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="h-4 w-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Return date is feasible
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="h-4 w-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Manager name is correct
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
