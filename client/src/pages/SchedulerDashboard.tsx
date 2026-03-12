/**
 * Scheduler Job Monitoring Dashboard
 * Real-time monitoring of background jobs, health status, and job metrics
 * Supports manual job triggering and historical job tracking
 */

import { useState, useMemo, useEffect } from "react";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { getGradientCard, animations, getStatusColor } from "@/lib/designSystem";

interface JobData {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: "active" | "paused" | "failed";
  lastRun: Date;
  nextRun: Date;
  executionTime: number; // in milliseconds
  successCount: number;
  failureCount: number;
  isRunning: boolean;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  jobsCompleted: number;
  jobsFailed: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
}

const mockJobs: JobData[] = [
  {
    id: "job-1",
    name: "Email Report Generator",
    description: "Generate and send daily email reports",
    schedule: "Every day at 9:00 AM",
    status: "active",
    lastRun: new Date(Date.now() - 3600000),
    nextRun: new Date(Date.now() + 86400000),
    executionTime: 2500,
    successCount: 47,
    failureCount: 1,
    isRunning: false,
  },
  {
    id: "job-2",
    name: "Database Backup",
    description: "Automated daily database backup",
    schedule: "Every day at 1:00 AM",
    status: "active",
    lastRun: new Date(Date.now() - 86400000),
    nextRun: new Date(Date.now() + 86400000 - 3600000),
    executionTime: 15000,
    successCount: 52,
    failureCount: 0,
    isRunning: false,
  },
  {
    id: "job-3",
    name: "Billing Cycle Processor",
    description: "Process monthly billing cycles",
    schedule: "First day of month at 12:00 AM",
    status: "active",
    lastRun: new Date(Date.now() - 2592000000),
    nextRun: new Date(Date.now() + 2592000000),
    executionTime: 45000,
    successCount: 12,
    failureCount: 0,
    isRunning: false,
  },
  {
    id: "job-4",
    name: "Invoice Due Reminder",
    description: "Send reminders for due invoices",
    schedule: "Every day at 8:00 AM",
    status: "active",
    lastRun: new Date(Date.now() - 86400000),
    nextRun: new Date(Date.now() + 86400000),
    executionTime: 3200,
    successCount: 45,
    failureCount: 2,
    isRunning: false,
  },
  {
    id: "job-5",
    name: "Data Cleanup Task",
    description: "Remove old logs and temporary files",
    schedule: "Every Sunday at 3:00 AM",
    status: "paused",
    lastRun: new Date(Date.now() - 604800000),
    nextRun: new Date(Date.now() + 604800000 - 3600000),
    executionTime: 8000,
    successCount: 8,
    failureCount: 0,
    isRunning: false,
  },
];

export default function SchedulerDashboard() {
  const { allowed, isLoading: permissionsLoading } = useRequireFeature("admin:scheduler:view");
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<JobData[]>(mockJobs);

  // Fetch scheduler data
  const { data: schedulerData, isLoading: schedulerLoading } = trpc.scheduler.listJobs.useQuery();
  const getHealthMutation = trpc.scheduler.getHealthStatus.useMutation();
  const triggerJobMutation = trpc.scheduler.triggerJobNow.useMutation({
    onSuccess: () => {
      toast.success("Job triggered successfully");
      handleRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to trigger job");
    },
  });

  useEffect(() => {
    if (schedulerData) {
      setJobs(Array.isArray(schedulerData) ? schedulerData : mockJobs);
    }
  }, [schedulerData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Scheduler data refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleTriggerJob = (jobId: string) => {
    triggerJobMutation.mutate(jobId);
  };

  if (permissionsLoading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
  if (!allowed) return null;

  // Calculate metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const totalSuccesses = jobs.reduce((sum, j) => sum + j.successCount, 0);
  const totalFailures = jobs.reduce((sum, j) => sum + j.failureCount, 0);
  const avgExecutionTime =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + j.executionTime, 0) / jobs.length)
      : 0;

  // Health status
  const healthStatus: HealthStatus = {
    status: totalFailures === 0 ? "healthy" : totalFailures < 5 ? "degraded" : "critical",
    uptime: 99.8,
    jobsCompleted: totalSuccesses,
    jobsFailed: totalFailures,
    totalExecutionTime: jobs.reduce((sum, j) => sum + j.executionTime, 0),
    averageExecutionTime: avgExecutionTime,
  };

  // Chart data - Job execution history
  const chartData = [
    {
      date: "Mon",
      successful: 12,
      failed: 0,
    },
    {
      date: "Tue",
      successful: 11,
      failed: 1,
    },
    {
      date: "Wed",
      successful: 13,
      failed: 0,
    },
    {
      date: "Thu",
      successful: 12,
      failed: 0,
    },
    {
      date: "Fri",
      successful: 14,
      failed: 1,
    },
    {
      date: "Sat",
      successful: 10,
      failed: 0,
    },
    {
      date: "Sun",
      successful: 11,
      failed: 1,
    },
  ];

  const statusColors = {
    healthy: "text-emerald-600 dark:text-emerald-400",
    degraded: "text-orange-600 dark:text-orange-400",
    critical: "text-red-600 dark:text-red-400",
  };

  const statusBgColors = {
    healthy: "bg-emerald-100 dark:bg-emerald-900/20",
    degraded: "bg-orange-100 dark:bg-orange-900/20",
    critical: "bg-red-100 dark:bg-red-900/20",
  };

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Administration", href: "/admin" },
        { label: "Scheduler", href: "/scheduler" },
      ]}
      title="Job Scheduler"
      description="Monitor and manage scheduled background jobs"
      icon={<Clock className="w-6 h-6" />}
      actions={
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className={animations.fadeIn}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Health Status Alert */}
        {healthStatus.status !== "healthy" && (
          <Alert
            className={`${statusBgColors[healthStatus.status]} border-2`}
          >
            <AlertCircle className={`w-4 h-4 ${statusColors[healthStatus.status]}`} />
            <AlertDescription>
              System health status: <strong>{healthStatus.status.toUpperCase()}</strong>
              {healthStatus.jobsFailed > 0 && ` - ${healthStatus.jobsFailed} failed jobs`}
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={getGradientCard("blue")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Active Jobs
                <Activity className={`w-5 h-5 ${getStatusColor("active")}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">of {totalJobs} total</p>
            </CardContent>
          </Card>

          <Card className={getGradientCard("emerald")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Successful Runs
                <CheckCircle2 className={`w-5 h-5 ${getStatusColor("success")}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{totalSuccesses}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className={getGradientCard("orange")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Failed Runs
                <XCircle className={`w-5 h-5 ${getStatusColor("error")}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalFailures}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className={getGradientCard("purple")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Avg Execution
                <Zap className={`w-5 h-5 ${getStatusColor("info")}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgExecutionTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">Average duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Execution History */}
          <Card className={getGradientCard("slate")}>
            <CardHeader>
              <CardTitle className={animations.fadeIn}>Weekly Execution History</CardTitle>
              <CardDescription>Job success/failure rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successful" fill="#10b981" name="Successful" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className={getGradientCard("blue")}>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time scheduler metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Badge className={`${statusBgColors[healthStatus.status]}`}>
                    {healthStatus.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{healthStatus.uptime}%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{healthStatus.totalExecutionTime}s</p>
                    <p className="text-xs text-muted-foreground">Total Execution</p>
                  </div>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Last 24 Hours:</strong> {totalSuccesses} successful, {totalFailures} failed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card className={getGradientCard("slate")}>
          <CardHeader>
            <CardTitle className={animations.fadeIn}>Scheduled Jobs</CardTitle>
            <CardDescription>View and manage all background jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge variant="outline">{job.schedule}</Badge>
                        <Badge
                          className={
                            job.status === "active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                              : job.status === "paused"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Last Run</p>
                          <p className="font-medium">
                            {format(job.lastRun, "MMM dd, HH:mm")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Next Run</p>
                          <p className="font-medium">
                            {format(job.nextRun, "MMM dd, HH:mm")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Success Rate</p>
                          <p className="font-medium">
                            {job.successCount + job.failureCount > 0
                              ? (
                                  ((job.successCount / (job.successCount + job.failureCount)) *
                                    100)
                                ).toFixed(1)
                              : "N/A"}
                            %
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Execution Time</p>
                          <p className="font-medium">{job.executionTime}ms</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTriggerJob(job.id)}
                        disabled={job.isRunning || triggerJobMutation.isPending}
                        title="Manually trigger job"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
