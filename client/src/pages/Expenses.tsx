import { ModuleLayout } from "@/components/ModuleLayout";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Plus, Search, Eye, Edit, Trash2, Receipt, TrendingUp, Loader2, Check, BarChart3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExpenseBudgetReport } from "@/components/ExpenseBudgetReport";

export default function Expenses() {
  // All hooks must be called at the top, before any conditional returns
  const { allowed, isLoading } = useRequireFeature("accounting:expenses:view");
  const [, navigate] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "budget">("list");
  
  // Fetch real data from backend
  const { data: expensesData = [], isLoading: isLoadingExpenses } = trpc.expenses.list.useQuery();
  const utils = trpc.useUtils();
  
  // Delete mutation
  const deleteExpenseMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expenses.list.invalidate();
      setDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  // Approve mutation (using centralized approvals system)
  const approveExpenseMutation = trpc.approvals.approveExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense approved successfully");
      utils.expenses.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve expense");
    },
  });

  // Early returns after all hooks are declared
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  // Safely convert frozen Drizzle objects to plain JS objects
  const plainExpensesData = (() => {
    if (!Array.isArray(expensesData)) return [];
    return expensesData.map(exp => {
      try {
        return JSON.parse(JSON.stringify(exp));
      } catch {
        return exp;
      }
    });
  })();

  // Transform backend data to display format
  const expenses = (() => {
    if (!Array.isArray(plainExpensesData)) return [];
    return (plainExpensesData as any[]).map((expense: any) => ({
      id: expense.id,
      date: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: expense.category || "General",
      description: expense.description || "",
      amount: (expense.amount || 0) / 100,
      vendor: expense.vendor || "Unknown",
      paymentMethod: expense.paymentMethod || "cash",
      status: expense.status || "pending",
      receipt: expense.receiptUrl || null,
    }));
  })();

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      paid: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredExpenses = (() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  })();

  const summary = (() => {
    return {
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      approved: expenses.filter(e => e.status === "approved").reduce((sum, e) => sum + e.amount, 0),
      pending: expenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
      categories: new Set(expenses.map(e => e.category)).size,
    };
  })();

  const handleDeleteClick = (id: string) => {
    setSelectedExpenseId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <ModuleLayout
      title="Expenses"
      description="Track and manage business expenses"
      icon={<DollarSign className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finance", href: "/finance" },
        { label: "Expenses" },
      ]}
      actions={
        <Button onClick={() => navigate("/expenses/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Record Expense
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b">
          <Button 
            variant={activeTab === "list" ? "default" : "ghost"}
            onClick={() => setActiveTab("list")}
            className="rounded-none border-b-2 border-b-transparent data-[active=true]:border-b-blue-500"
            data-active={activeTab === "list"}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Expense List
          </Button>
          <Button 
            variant={activeTab === "budget" ? "default" : "ghost"}
            onClick={() => setActiveTab("budget")}
            className="rounded-none border-b-2 border-b-transparent data-[active=true]:border-b-blue-500"
            data-active={activeTab === "budget"}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Budget Report
          </Button>
        </div>

        {/* Expense List Tab */}
        {activeTab === "list" && (
          <>
        <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(summary.total || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(summary.approved || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{expenses.filter(e => e.status === "approved").length} expenses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Receipt className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {(summary.pending || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{expenses.filter(e => e.status === "pending").length} expenses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Receipt className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.categories}</div>
              <p className="text-xs text-muted-foreground">Expense categories</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>View and manage expense records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(new Set(expenses.map(e => e.category))).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingExpenses ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        Loading expenses...
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.vendor}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                        <TableCell className="font-mono">Ksh {(expense.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {expense.status === "pending" && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => approveExpenseMutation.mutate({ id: expense.id })}
                                title="Approve Expense"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/expenses/${expense.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/expenses/${expense.id}/edit`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense record? This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedExpenseId && deleteExpenseMutation.mutate(selectedExpenseId)}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteExpenseMutation.isPending}
              >
                {deleteExpenseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        </div>
        </>
        )}

        {/* Budget Report Tab */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <ExpenseBudgetReport />
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
