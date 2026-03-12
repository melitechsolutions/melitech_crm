import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";

export default function AttendanceDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch attendance record from backend
  const { data: attendanceData, isLoading } = trpc.attendance.getById.useQuery(id || "");
  const { data: employeesData = [] } = trpc.employees.list.useQuery();
  const utils = trpc.useUtils();

  const deleteAttendanceMutation = trpc.attendance.delete.useMutation({
    onSuccess: () => {
      toast.success("Attendance record deleted successfully");
      utils.attendance.list.invalidate();
      setLocation("/attendance");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete attendance record");
    },
  });

  // Get employee info
  const employee = attendanceData ? (employeesData as any[]).find((e: any) => e.id === (attendanceData as any).employeeId) : null;

  const attendanceRecord = attendanceData ? {
    id: id,
    employeeId: (attendanceData as any).employeeId || "Unknown",
    employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee",
    date: (attendanceData as any).date ? new Date((attendanceData as any).date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    checkIn: (attendanceData as any).checkInTime ? new Date((attendanceData as any).checkInTime).toLocaleTimeString() : "Not checked in",
    checkOut: (attendanceData as any).checkOutTime ? new Date((attendanceData as any).checkOutTime).toLocaleTimeString() : "Not checked out",
    status: (attendanceData as any).status || "absent",
    hoursWorked: (attendanceData as any).checkInTime && (attendanceData as any).checkOutTime 
      ? ((new Date((attendanceData as any).checkOutTime).getTime() - new Date((attendanceData as any).checkInTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
      : 0,
    notes: (attendanceData as any).notes || "",
  } : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteAttendanceMutation, id || "");
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
          <p>Loading attendance record...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!attendanceRecord) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Attendance record not found</p>
          <Button onClick={() => setLocation("/attendance")}>Back to Attendance</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/attendance")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Attendance Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{attendanceRecord.employeeName}</CardTitle>
            <CardDescription>Date: {attendanceRecord.date}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Employee ID</p>
                <p className="font-semibold">{attendanceRecord?.employeeId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`font-semibold ${(attendanceRecord?.status || 'absent') === 'present' ? 'text-green-600' : (attendanceRecord?.status || 'absent') === 'late' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {((attendanceRecord?.status || "absent") as string).charAt(0).toUpperCase() + ((attendanceRecord?.status || "absent") as string).slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Check In</p>
                <p className="font-semibold">{attendanceRecord?.checkIn || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Check Out</p>
                <p className="font-semibold">{attendanceRecord?.checkOut || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600">Hours Worked</p>
                <p className="font-semibold">{attendanceRecord.hoursWorked} hours</p>
              </div>
              {attendanceRecord.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Notes</p>
                  <p className="font-semibold">{attendanceRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="gap-2" onClick={() => setLocation(`/attendance/${id}/edit`)}>
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
          title="Delete Attendance Record"
          description="Are you sure you want to delete this attendance record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
