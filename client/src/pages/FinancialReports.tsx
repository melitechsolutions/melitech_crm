import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function FinancialReportsPage() {
  const { allowed, isLoading } = useRequireFeature("reports:financial");
  
  const [from, setFrom] = useState<string>(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));

  const plQuery = trpc.financialReports.profitLoss.useQuery(
    { startDate: from, endDate: to },
    { enabled: !!from && !!to }
  );

  const bsQuery = trpc.financialReports.balanceSheet.useQuery();
  
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleRun = () => {
    if (!from || !to) {
      toast.error("Please select both dates");
      return;
    }
    plQuery.refetch();
    bsQuery.refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">Profit & Loss and balance sheet summaries</p>
          </div>
          <div>
            <Button onClick={handleRun}>Run</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {plQuery.data && (
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss ({from} - {to})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>Total Revenue: Ksh {(plQuery.data.revenue / 100).toLocaleString('en-KE')}</div>
                  <div>Total Expenses: Ksh {(plQuery.data.expenses / 100).toLocaleString('en-KE')}</div>
                  <div className={`font-semibold ${plQuery.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net Profit: Ksh {(plQuery.data.netProfit / 100).toLocaleString('en-KE')}
                  </div>
                  <div>Net Margin: {(plQuery.data.netMarginPercentage || 0).toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {bsQuery.data && (
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Account Type</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bsQuery.data).map(([type, amt]) => (
                    <tr key={type} className="border-b">
                      <td>{type}</td>
                      <td className="text-right">Ksh {(amt / 100).toLocaleString('en-KE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
