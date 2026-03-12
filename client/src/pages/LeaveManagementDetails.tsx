import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import mutateAsync from '@/lib/mutationHelpers';

export default function LeaveManagementDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch leave request from backend
  const { data: leaveData, isLoading } = trpc.leave.getById.useQuery(id || "");
  const { data: employeesData = [] } = trpc.employees.list.useQuery();
  const utils = trpc.useUtils();

  const deleteLeaveMutation = trpc.leave.delete.useMutation({
    onSuccess: () => {
      toast.success("Leave request deleted successfully");
      utils.leave.list.invalidate();
      setLocation("/leave-management");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete leave request");
    },
  });

  // Get employee info
  const employee = leaveData ? (employeesData as any[]).find((e: any) => e.id === (leaveData as any).employeeId) : null;

  // Calculate days
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaveRecord = leaveData ? {
    id: id,
    employeeId: (leaveData as any).employeeId || "Unknown",
    employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee",
    leaveType: (leaveData as any).leaveType || "Annual Leave",
    startDate: (leaveData as any).startDate ? new Date((leaveData as any).startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: (leaveData as any).endDate ? new Date((leaveData as any).endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    daysRequested: (leaveData as any).startDate && (leaveData as any).endDate 
      ? calculateDays((leaveData as any).startDate, (leaveData as any).endDate)
      : 0,
    status: (leaveData as any).status || "pending",
    reason: (leaveData as any).reason || "",
  } : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteLeaveMutation, id || "");
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
          <p>Loading leave request...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!leaveRecord) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Leave request not found</p>
          <Button onClick={() => setLocation("/leave-management")}>Back to Leave Management</Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/leave-management")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Leave Request Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{leaveRecord.employeeName}</CardTitle>
            <CardDescription>{leaveRecord.leaveType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Employee ID</p>
                <p className="font-semibold">{leaveRecord?.employeeId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`font-semibold ${getStatusColor(leaveRecord?.status || "pending")}`}>
                  {((leaveRecord?.status || "pending") as string).charAt(0).toUpperCase() + ((leaveRecord?.status || "pending") as string).slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Start Date</p>
                <p className="font-semibold">{leaveRecord?.startDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">End Date</p>
                <p className="font-semibold">{leaveRecord.endDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600">Days Requested</p>
                <p className="font-semibold">{leaveRecord.daysRequested} days</p>
              </div>
              {leaveRecord.reason && (
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Reason</p>
                  <p className="font-semibold">{leaveRecord.reason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="gap-2" onClick={() => setLocation(`/leave-management/${id}/edit`)}>
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
          title="Delete Leave Request"
          description="Are you sure you want to delete this leave request? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
