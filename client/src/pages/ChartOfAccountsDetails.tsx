import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { ArrowLeft, Edit2, Trash2, Loader2, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ChartOfAccountsDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: account, isLoading } = trpc.chartOfAccounts.getById.useQuery(
    { id: id || "" },
    { enabled: !!id }
  );

  const deleteAccountMutation = trpc.chartOfAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully");
      setLocation("/chart-of-accounts");
    },
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
      setIsDeleting(false);
      setShowDeleteModal(false);
    },
  });

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    deleteAccountMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setLocation("/chart-of-accounts")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center p-12 bg-slate-50 rounded-lg border border-dashed">
            <p className="text-slate-600">Account not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/chart-of-accounts")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Account Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{account.accountName}</CardTitle>
            <CardDescription>Code: {account.accountCode}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Account Type</p>
                <p className="font-semibold capitalize">{account.accountType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`font-semibold ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Balance</p>
                <p className="font-semibold">Ksh {(Number(account.balance || 0) / 100).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600">Description</p>
                <p className="font-semibold">{account.description || 'No description provided'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="gap-2" onClick={() => setLocation(`/chart-of-accounts/${id}/edit`)}>
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
          title="Delete Account"
          description="Are you sure you want to delete this account? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
