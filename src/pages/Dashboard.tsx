import { FileText, CheckCircle, Clock, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProcurementStatus } from "@/components/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStats, useDashboardTrends, useDashboardDivisions, useLatestPengajuan } from "@/hooks/useDashboard";
import { ProcurementFlowChart } from "@/components/ProcurementFlowChart";
import { format } from "date-fns";

// Helper function untuk format Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper function untuk format budget singkat (2.5M, 500K, dll)
function formatBudgetShort(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

// Helper function untuk map status dari database ke ProcurementStatus
function mapStatus(status: string | null): ProcurementStatus {
  if (!status) return "pending";
  
  const statusMap: Record<string, ProcurementStatus> = {
    approved: "approved",
    disetujui: "approved",
    pending: "pending",
    menunggu: "pending",
    rejected: "rejected",
    ditolak: "rejected",
    in_progress: "in_progress",
    dalam_proses: "in_progress",
    completed: "completed",
    selesai: "completed",
    pending_evaluation: "pending_evaluation",
    evaluated: "evaluated",
    waiting_po: "waiting_po",
    po_issued: "po_issued",
    in_delivery: "in_delivery",
  };
  
  return statusMap[status.toLowerCase()] || "pending";
}

export default function Dashboard() {
  // Fetch data dari API
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: trendData, isLoading: trendsLoading } = useDashboardTrends();
  const { data: divisionData, isLoading: divisionsLoading } = useDashboardDivisions();
  const { data: latestPengajuan, isLoading: latestLoading } = useLatestPengajuan(5);

  const isLoading = statsLoading || trendsLoading || divisionsLoading || latestLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data dashboard. Silakan coba lagi atau hubungi administrator.
            <br />
            <span className="text-xs mt-2 block">
              {statsError instanceof Error ? statsError.message : "Unknown error"}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor sistem procurement Anda</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pengajuan"
            value={stats?.totalPengajuan.toString() || "0"}
            icon={FileText}
            trend={stats && stats.totalPengajuan > 0 ? `${stats.totalPengajuan} pengajuan` : "Belum ada data"}
            variant="default"
          />
          <StatCard
            title="Disetujui"
            value={stats?.totalDisetujui.toString() || "0"}
            icon={CheckCircle}
            trend={stats ? `${stats.approvalRate}% approval rate` : "0% approval rate"}
            variant="success"
          />
          <StatCard
            title="Pending"
            value={stats?.totalPending.toString() || "0"}
            icon={Clock}
            trend={stats && stats.totalPending > 0 ? "Perlu review" : "Tidak ada pending"}
            variant="warning"
          />
          <StatCard
            title="Total Budget"
            value={stats ? formatBudgetShort(stats.totalBudget) : "0"}
            icon={TrendingUp}
            trend="IDR (YTD)"
            variant="default"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Line Chart - Tren Pengajuan */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tren Pengajuan Pengadaan</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Total Pengajuan"
                    />
                    <Line
                      type="monotone"
                      dataKey="selesai"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      name="Selesai"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>Belum ada data tren</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabel Ringkasan per Divisi */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Ringkasan Pengadaan per Divisi</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Divisi</TableHead>
                      <TableHead className="w-[140px]">Jumlah Pengajuan</TableHead>
                      <TableHead className="w-[100px]">Selesai</TableHead>
                      <TableHead className="w-[100px]">% Selesai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {divisionData && divisionData.length > 0 ? (
                      divisionData.map((div) => (
                        <TableRow key={div.divisi}>
                          <TableCell className="font-medium text-sm">{div.divisi}</TableCell>
                          <TableCell className="text-sm">{div.total}</TableCell>
                          <TableCell className="text-sm">{div.selesai}</TableCell>
                          <TableCell className="text-sm">{div.persentase}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Belum ada data divisi
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Procurement Flow Mapping */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <ProcurementFlowChart />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengajuan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {latestPengajuan && latestPengajuan.length > 0 ? (
              <div className="space-y-4">
                {latestPengajuan.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">
                          {request.no_surat || request.id.substring(0, 8)}
                        </span>
                        <h3 className="font-semibold">{request.judul || "Tanpa Judul"}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.unit || "Unknown"} • {request.timestamp ? format(new Date(request.timestamp), "dd MMM yyyy") : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-semibold text-lg">
                        {formatRupiah(request.nilai_pengajuan || 0)}
                      </span>
                      <StatusBadge status={mapStatus(request.status)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Belum ada pengajuan terbaru
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
