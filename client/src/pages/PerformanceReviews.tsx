import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PerformanceReviewsPage() {
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const employeesQ = trpc.employees.list.useQuery();

  const listQ = trpc.performanceReviews.list.useQuery({ employeeId: filterEmployee || undefined, status: filterStatus === 'all' ? undefined : filterStatus });
  const createMut = trpc.performanceReviews.create.useMutation({ onSuccess() { toast.success('Created'); listQ.refetch(); setShowCreate(false); } });
  const updateMut = trpc.performanceReviews.update.useMutation({ onSuccess() { toast.success('Updated'); listQ.refetch(); setShowEdit(false); setEditing(null); } });
  const deleteMut = trpc.performanceReviews.delete.useMutation({ onSuccess() { toast.success('Deleted'); listQ.refetch(); } });

  const reviews = listQ.data || [];

  const [form, setForm] = useState({ employeeId: '', reviewerId: '', rating: 5, comments: '', goals: '', status: 'pending' as 'pending' | 'in_progress' | 'completed', reviewDate: undefined as Date | undefined });

  const handleCreate = () => {
    if (!form.employeeId || !form.reviewerId) { toast.error('Employee and reviewer required'); return; }
    createMut.mutate({ employeeId: form.employeeId, reviewerId: form.reviewerId, rating: form.rating, comments: form.comments, goals: form.goals, status: form.status, reviewDate: form.reviewDate });
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ employeeId: r.employeeId, reviewerId: r.reviewerId, rating: r.rating, comments: r.comments || '', goals: r.goals || '', status: r.status, reviewDate: r.reviewDate ? new Date(r.reviewDate) : undefined });
    setShowEdit(true);
  };

  const handleUpdate = () => {
    if (!editing) return;
    updateMut.mutate({ id: editing.id, rating: form.rating, comments: form.comments, goals: form.goals, status: form.status, reviewDate: form.reviewDate });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Reviews</h1>
            <p className="text-muted-foreground">Create and manage employee performance reviews</p>
          </div>
          <div>
            <Button onClick={() => {
              setForm({ employeeId:'', reviewerId:'', rating:5, comments:'', goals:'', status:'pending', reviewDate:undefined });
              setShowCreate(true);
            }}>New Review</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input placeholder="Employee ID" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => listQ.refetch()}>Apply</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {reviews.map((r: any) => (
            <Card key={r.id}>
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{r.employeeId} — Reviewer: {r.reviewerId}</div>
                    <div className="text-sm text-muted-foreground">Rating: {r.rating} • Status: {r.status}</div>
                    <div className="mt-2 text-sm">Comments: {r.comments}</div>
                    <div className="mt-2 text-sm">Goals: {r.goals}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => openEdit(r)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(r.id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Modal (simple) */}
        {showCreate && (
          <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
            <div className="space-y-4 p-4">
              <h3 className="text-lg font-medium">New Performance Review</h3>
              <label className="text-sm">Employee</label>
              <select className="w-full" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Select employee...</option>
                {(employeesQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{(e.firstName || "")} {(e.lastName || "")} ({e.id})</option>)}
              </select>
              <label className="text-sm">Reviewer</label>
              <select className="w-full" value={form.reviewerId} onChange={(e) => setForm({ ...form, reviewerId: e.target.value })}>
                <option value="">Select reviewer...</option>
                {(employeesQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{(e.firstName || "")} {(e.lastName || "")} ({e.id})</option>)}
              </select>
              <label className="text-sm">Rating</label>
              <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              <label className="text-sm">Status</label>
              <Select value={form.status || 'pending'} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-sm">Review Date</label>
              <Input type="date" value={form.reviewDate ? form.reviewDate.toISOString().slice(0,10) : ''} onChange={(e) => setForm({ ...form, reviewDate: e.target.value ? new Date(e.target.value) : undefined })} />
              <label className="text-sm">Comments</label>
              <Input placeholder="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
              <label className="text-sm">Goals</label>
              <Input placeholder="Goals" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </Modal>
        )}

        {showEdit && editing && (
          <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setEditing(null); }}>
            <div className="space-y-4 p-4">
              <h3 className="text-lg font-medium">Edit Performance Review</h3>
              <label className="text-sm">Employee</label>
              <Input value={form.employeeId} disabled />
              <label className="text-sm">Reviewer</label>
              <select className="w-full" value={form.reviewerId} onChange={(e) => setForm({ ...form, reviewerId: e.target.value })}>
                <option value="">Select reviewer...</option>
                {(employeesQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{(e.firstName || "")} {(e.lastName || "")} ({e.id})</option>)}
              </select>
              <label className="text-sm">Rating</label>
              <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              <label className="text-sm">Status</label>
              <Select value={editing?.status || 'pending'} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-sm">Review Date</label>
              <Input type="date" value={form.reviewDate ? form.reviewDate.toISOString().slice(0,10) : ''} onChange={(e) => setForm({ ...form, reviewDate: e.target.value ? new Date(e.target.value) : undefined })} />
              <label className="text-sm">Comments</label>
              <Input placeholder="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
              <label className="text-sm">Goals</label>
              <Input placeholder="Goals" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowEdit(false); setEditing(null); }}>Cancel</Button>
                <Button onClick={handleUpdate}>Save</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
