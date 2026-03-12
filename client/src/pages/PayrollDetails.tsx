import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import mutateAsync from '@/lib/mutationHelpers';
import { toast } from "sonner";

export default function PayrollDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch payroll from backend
  const { data: payrollData, isLoading } = trpc.payroll.getById.useQuery(id || "");
  const { data: employeesData = [] } = trpc.employees.list.useQuery();
  const utils = trpc.useUtils();

  const deletePayrollMutation = trpc.payroll.delete.useMutation({
    onSuccess: () => {
      toast.success("Payroll record deleted successfully");
      utils.payroll.list.invalidate();
      setLocation("/payroll");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete payroll record");
    },
  });

  // Get employee info
  const employee = payrollData ? (employeesData as any[]).find((e: any) => e.id === (payrollData as any).employeeId) : null;

  // Format period
  const formatPeriod = (payPeriodStart: string, payPeriodEnd: string) => {
    const start = new Date(payPeriodStart);
    const end = new Date(payPeriodEnd);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const payrollRecord = payrollData ? {
    id: id,
    employeeId: (payrollData as any).employeeId || "Unknown",
    employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee",
    period: (payrollData as any).payPeriodStart && (payrollData as any).payPeriodEnd
      ? formatPeriod((payrollData as any).payPeriodStart, (payrollData as any).payPeriodEnd)
      : "Unknown Period",
    baseSalary: ((payrollData as any).basicSalary || 0) / 100,
    allowances: ((payrollData as any).allowances || 0) / 100,
    deductions: ((payrollData as any).deductions || 0) / 100,
    tax: ((payrollData as any).tax || 0) / 100,
    netSalary: ((payrollData as any).netSalary || 0) / 100,
    status: (payrollData as any).status || "draft",
  } : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deletePayrollMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading payroll record...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!payrollRecord) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Payroll record not found</p>
          <Button onClick={() => setLocation("/payroll")}>Back to Payroll</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/payroll")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Payroll Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{payrollRecord?.employeeName || "Employee"}</CardTitle>
            <CardDescription>Period: {payrollRecord?.period || "N/A"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Employee ID</p>
                <p className="font-semibold">{payrollRecord?.employeeId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`font-semibold ${(payrollRecord?.status || 'pending') === 'processed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {((payrollRecord?.status || "pending") as string).charAt(0).toUpperCase() + ((payrollRecord?.status || "pending") as string).slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Base Salary</p>
                <p className="font-semibold">KES {(payrollRecord?.baseSalary || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Allowances</p>
                <p className="font-semibold text-green-600">+ KES {(payrollRecord?.allowances || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Deductions</p>
                <p className="font-semibold text-red-600">- KES {(payrollRecord?.deductions || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tax</p>
                <p className="font-semibold text-red-600">- KES {(payrollRecord?.tax || 0).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600">Net Salary</p>
                <p className="font-semibold text-lg">KES {(payrollRecord?.netSalary || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="gap-2" onClick={() => setLocation(`/payroll/${id}/edit`)}>
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
          title="Delete Payroll Record"
          description="Are you sure you want to delete this payroll record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
