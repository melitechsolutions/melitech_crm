import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Receipt, ArrowLeft, Save, Download, Loader2, AlertCircle } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";

export default function CreateExpense() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:expenses:create");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState({
    expenseNumber: "",
    category: "",
    vendor: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    description: "",
    status: "pending",
    chartOfAccountId: "",
    budgetAllocationId: "",
  });

  const [isLoadingNumber, setIsLoadingNumber] = useState(true);
  const [selectedBudgetAllocation, setSelectedBudgetAllocation] = useState<any>(null);
  const getNextNumberMutation = trpc.settings.getNextDocumentNumber.useMutation();

  // Generate expense number on component mount
  useEffect(() => {
    let isMounted = true;
    const generateNumber = () => {
      setIsLoadingNumber(true);
      getNextNumberMutation.mutate(
        { documentType: 'expense' },
        {
          onSuccess: (result) => {
            if (isMounted) setFormData(prev => ({ ...prev, expenseNumber: result.documentNumber || `EXP-${String(Math.random() * 1000000 | 0).padStart(6, '0')}` }));
          },
          onError: () => {
            if (isMounted) setFormData(prev => ({ ...prev, expenseNumber: `EXP-${String(Math.random() * 1000000 | 0).padStart(6, '0')}` }));
          },
          onSettled: () => {
            if (isMounted) setIsLoadingNumber(false);
          },
        }
      );
    };
    generateNumber();
    return () => { isMounted = false; };
  }, []);

  // Fetch Chart of Accounts
  const { data: chartOfAccounts = [] } = trpc.chartOfAccounts.list.useQuery();

  // Fetch available budget allocations
  const { data: budgetAllocations = [] } = trpc.expenses.getAvailableBudgetAllocations.useQuery();

  // Handle budget allocation selection
  const handleBudgetAllocationChange = (budgetId: string) => {
    setFormData({ ...formData, budgetAllocationId: budgetId });
    const selected = budgetAllocations.find((b: any) => b.id === budgetId);
    setSelectedBudgetAllocation(selected);
  };

  const createExpenseMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      toast.success("Expense created successfully!");
      utils.expenses.list.invalidate();
      navigate("/expenses");
    },
    onError: (error: any) => {
      toast.error(`Failed to create expense: ${error.message}`);
    },
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || !formData.chartOfAccountId) {
      toast.error("Please fill in all required fields (Category, Amount, and Chart of Account)");
      return;
    }

    const accountId = parseInt(formData.chartOfAccountId);
    if (isNaN(accountId)) {
      toast.error("Invalid Chart of Account selection");
      return;
    }

    createExpenseMutation.mutate({
      expenseNumber: formData.expenseNumber,
      category: formData.category,
      vendor: formData.vendor || undefined,
      amount: Math.round(parseFloat(formData.amount) * 100),
      expenseDate: new Date(formData.expenseDate).toISOString().split("T")[0],
      paymentMethod: formData.paymentMethod as any,
      description: formData.description || undefined,
      status: formData.status as any,
      chartOfAccountId: accountId,
      budgetAllocationId: formData.budgetAllocationId || undefined,
    });
  };

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('expense_draft', JSON.stringify(draftData));
    toast.success("Expense draft saved locally");
  };

  const handleDownloadPDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to download PDF");
        setIsGeneratingPDF(false);
        return;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Expense Report - ${formData.category}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-info { text-align: right; font-size: 12px; }
            .document-title { font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
            .info-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { }
            .amount { font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px; margin: 20px 0; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-approved { background: #d1fae5; color: #065f46; }
            .status-rejected { background: #fee2e2; color: #991b1b; }
            .status-paid { background: #dbeafe; color: #1e40af; }
            .notes { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="document-title">EXPENSE REPORT</div>
              <div><strong>Draft</strong></div>
            </div>
            <div class="company-info">
              <strong>${APP_TITLE}</strong><br>
              P.O. Box 12345-00100<br>
              Nairobi, Kenya<br>
              info@melitechsolutions.co.ke<br>
              +254 700 000 000
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="label">Category:</span>
              <span class="value">${formData.category || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Vendor:</span>
              <span class="value">${formData.vendor || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Expense Date:</span>
              <span class="value">${formData.expenseDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Method:</span>
              <span class="value">${((formData.paymentMethod || 'cash').replace('_', ' ').toUpperCase())}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value"><span class="status status-${(formData.status || 'pending')}">${(formData.status || 'pending').toUpperCase()}</span></span>
            </div>
          </div>
          
          <div class="amount">
            Amount: KES ${parseFloat(formData.amount || '0').toLocaleString()}
          </div>
          
          ${formData.description ? `
            <div class="notes">
              <strong>Description:</strong><br>
              ${formData.description}
            </div>
          ` : ''}
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("PDF download initiated");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [formData]);

  return (
    <ModuleLayout
      title="Record Expense"
      description="Add a new expense to your records"
      icon={<Receipt className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
        { label: "Expenses", href: "/expenses" },
        { label: "Record Expense" },
      ]}
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Record Expense</CardTitle>
            <CardDescription>
              Enter the expense details below to record a new expense
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="expenseNumber">Expense Number</Label>
                <Input
                  id="expenseNumber"
                  value={formData.expenseNumber}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed font-mono"
                  placeholder={isLoadingNumber ? "Generating..." : ""}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Office Supplies"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="e.g., ABC Supplies Ltd"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Ksh) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Expense Date *</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expenseDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chartOfAccountId">Chart of Account *</Label>
                <Select
                  value={formData.chartOfAccountId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, chartOfAccountId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartOfAccounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountCode} - {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetAllocationId">Budget Allocation (Optional)</Label>
                <Select
                  value={formData.budgetAllocationId}
                  onValueChange={handleBudgetAllocationChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget allocation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {budgetAllocations.map((allocation: any) => (
                      <SelectItem key={allocation.id} value={allocation.id}>
                        {allocation.categoryName} - Ksh {(allocation.remaining / 100).toLocaleString('en-KE')} remaining
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBudgetAllocation && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      {selectedBudgetAllocation.categoryName}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <p className="text-blue-700 dark:text-blue-300">Allocated:</p>
                        <p className="font-mono font-bold">Ksh {(selectedBudgetAllocation.allocatedAmount / 100).toLocaleString('en-KE')}</p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-300">Spent:</p>
                        <p className="font-mono font-bold">Ksh {(selectedBudgetAllocation.spentAmount / 100).toLocaleString('en-KE')}</p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-300">Remaining:</p>
                        <p className={`font-mono font-bold ${selectedBudgetAllocation.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Ksh {(selectedBudgetAllocation.remaining / 100).toLocaleString('en-KE')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedBudgetAllocation && formData.amount && parseFloat(formData.amount) > selectedBudgetAllocation.remaining / 100 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 rounded flex gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    This expense amount exceeds the remaining budget. It will overrun the allocation.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                >
                  {createExpenseMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Record Expense
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/expenses")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
