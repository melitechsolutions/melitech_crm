import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Edit2, Trash2, Unlink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";

export default function ExpensesDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");

  // Fetch expense from backend
  const { data: expenseData, isLoading } = trpc.expenses.getById.useQuery(id || "");
  // Fetch available budget allocations
  const { data: budgetAllocations = [] } = trpc.expenses.getAvailableBudgetAllocations.useQuery();
  
  const utils = trpc.useUtils();

  const deleteExpenseMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expenses.list.invalidate();
      setLocation("/expenses");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  const updateBudgetMutation = trpc.expenses.updateBudgetAllocation.useMutation({
    onSuccess: () => {
      toast.success("Budget allocation updated successfully");
      utils.expenses.getById.invalidate(id);
      setShowBudgetDialog(false);
      setSelectedBudgetId("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update budget allocation");
    },
  });

  const expense = expenseData ? {
    id: expenseData.id || id,
    description: (expenseData as any).description || "Unknown Expense",
    category: (expenseData as any).category || "General",
    amount: ((expenseData as any).amount || 0) / 100,
    date: (expenseData as any).expenseDate ? new Date((expenseData as any).expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    vendor: (expenseData as any).vendor || "Unknown",
    paymentMethod: (expenseData as any).paymentMethod || "cash",
    status: (expenseData as any).status || "pending",
    approvedBy: (expenseData as any).approvedBy || "",
    budgetAllocationId: (expenseData as any).budgetAllocationId || null,
  } : null;

  const currentBudgetAllocation = budgetAllocations.find((b: any) => b.id === expense?.budgetAllocationId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteExpenseMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateBudget = () => {
    if (!id) return;
    updateBudgetMutation.mutate({
      expenseId: id,
      // convert "none" sentinel back to null for the API
      budgetAllocationId:
        selectedBudgetId === "none" ? null : selectedBudgetId || null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading expense...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!expense) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Expense not found</p>
          <Button onClick={() => setLocation("/expenses")}>Back to Expenses</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/expenses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Expense Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{expense.description}</CardTitle>
            <CardDescription>Category: {expense.category}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Amount</p>
                <p className="font-semibold">KES {(expense?.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-semibold">{expense?.date || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Vendor</p>
                <p className="font-semibold">{expense?.vendor || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Payment Method</p>
                <p className="font-semibold">{expense?.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`font-semibold ${expense?.status === 'approved' ? 'text-green-600' : expense?.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {(expense?.status || "pending").charAt(0).toUpperCase() + (expense?.status || "pending").slice(1)}
                </p>
              </div>
              {expense.approvedBy && (
                <div>
                  <p className="text-sm text-slate-600">Approved By</p>
                  <p className="font-semibold">{expense.approvedBy}</p>
                </div>
              )}
            </div>

            {/* Budget Allocation Section */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Budget Allocation</p>
                  {currentBudgetAllocation ? (
                    <div>
                      <p className="font-semibold">{currentBudgetAllocation.categoryName}</p>
                      <p className="text-xs text-slate-500">
                        {((currentBudgetAllocation.spentAmount || 0) / 100).toLocaleString()} / {(currentBudgetAllocation.allocatedAmount / 100).toLocaleString()} KES
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold text-slate-500">Not assigned</p>
                  )}
                </div>
                <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {currentBudgetAllocation ? "Change" : "Assign"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Budget Allocation</DialogTitle>
                      <DialogDescription>
                        Select a budget allocation to link this expense to, or leave empty to remove.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget allocation..." />
                        </SelectTrigger>
                        <SelectContent>
                          {/* using a non-empty sentinel so radix doesn't throw */}
                          <SelectItem value="none">None (Remove allocation)</SelectItem>
                          {budgetAllocations.map((allocation: any) => (
                            <SelectItem key={allocation.id} value={allocation.id}>
                              {allocation.categoryName} ({((allocation.allocatedAmount - (allocation.spentAmount || 0)) / 100).toLocaleString()} KES remaining)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleUpdateBudget}
                        disabled={updateBudgetMutation.isPending}
                      >
                        {updateBudgetMutation.isPending ? "Updating..." : "Update Allocation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="gap-2" onClick={() => setLocation(`/expenses/${id}/edit`)}>
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Expense"
          description="Are you sure you want to delete this expense? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
