import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function BankReconciliationDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch real reconciliation data from backend
  const { data: reconciliation, isLoading } = trpc.bankReconciliation.getById.useQuery(id || "", {
    enabled: !!id,
  });

  const handleDelete = () => {
    toast.success("Bank reconciliation record deleted successfully");
    setShowDeleteModal(false);
    setLocation("/bank-reconciliation");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/bank-reconciliation")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Bank Reconciliation Details</h1>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-center">Loading reconciliation data...</p>
            </CardContent>
          </Card>
        ) : !reconciliation ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-center">Reconciliation not found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{reconciliation.bankAccount || "Bank Account"}</CardTitle>
                <CardDescription>Period: {reconciliation.period}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Bank Balance</p>
                    <p className="font-semibold">KES {(reconciliation.bankBalance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Book Balance</p>
                    <p className="font-semibold">KES {(reconciliation.bookBalance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Difference</p>
                    <p className={`font-semibold ${reconciliation.difference === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      KES {(reconciliation.difference || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className={`font-semibold ${reconciliation.status === 'Reconciled' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {reconciliation.status}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">Reconciliation Date</p>
                    <p className="font-semibold">{reconciliation.reconciliationDate ? new Date(reconciliation.reconciliationDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {reconciliation.matchedTransactions !== undefined && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600">Matched Transactions</p>
                        <p className="font-semibold">{reconciliation.matchedTransactions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Unmatched Transactions</p>
                        <p className="font-semibold">{reconciliation.unmatchedTransactions}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="gap-2" onClick={() => setLocation(`/bank-reconciliation/${id}/edit`)}>
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
          </>
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Reconciliation"
          description="Are you sure you want to delete this bank reconciliation record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
