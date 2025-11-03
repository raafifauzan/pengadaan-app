import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProcurementStatus } from "@/components/StatusBadge";
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

const mockRequests = [
  {
    id: "PR-001",
    title: "Pengadaan Laptop Dell XPS 15",
    department: "IT Department",
    amount: "Rp 45.000.000",
    status: "approved" as ProcurementStatus,
    date: "2024-03-15",
  },
  {
    id: "PR-002",
    title: "Pengadaan Furniture Kantor",
    department: "General Affairs",
    amount: "Rp 25.000.000",
    status: "pending" as ProcurementStatus,
    date: "2024-03-14",
  },
  {
    id: "PR-003",
    title: "Pengadaan Software Lisensi",
    department: "IT Department",
    amount: "Rp 15.000.000",
    status: "in_progress" as ProcurementStatus,
    date: "2024-03-13",
  },
];

const trendData = [
  { month: "Jan", total: 45, selesai: 38 },
  { month: "Feb", total: 52, selesai: 45 },
  { month: "Mar", total: 48, selesai: 42 },
  { month: "Apr", total: 61, selesai: 55 },
  { month: "May", total: 55, selesai: 48 },
  { month: "Jun", total: 67, selesai: 60 },
];

const divisionData = [
  { divisi: "IT", total: 45, selesai: 40, persentase: 88.9 },
  { divisi: "GA", total: 32, selesai: 28, persentase: 87.5 },
  { divisi: "Marketing", total: 28, selesai: 25, persentase: 89.3 },
  { divisi: "Finance", total: 21, selesai: 19, persentase: 90.5 },
  { divisi: "HR", total: 18, selesai: 15, persentase: 83.3 },
];

export default function Dashboard() {
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
            value="24"
            icon={FileText}
            trend="+3 bulan ini"
            variant="default"
          />
          <StatCard
            title="Disetujui"
            value="18"
            icon={CheckCircle}
            trend="75% approval rate"
            variant="success"
          />
          <StatCard
            title="Pending"
            value="6"
            icon={Clock}
            trend="Perlu review"
            variant="warning"
          />
          <StatCard
            title="Total Budget"
            value="2.5M"
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
                    {divisionData.map((div) => (
                      <TableRow key={div.divisi}>
                        <TableCell className="font-medium text-sm">{div.divisi}</TableCell>
                        <TableCell className="text-sm">{div.total}</TableCell>
                        <TableCell className="text-sm">{div.selesai}</TableCell>
                        <TableCell className="text-sm">{div.persentase}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reserved Section for Future Mapping */}
        <Card className="shadow-lg border-dashed">
          <CardContent className="flex items-center justify-center h-48">
            <p className="text-muted-foreground text-sm">
              Reserved: Peta Mapping Pengadaan (Coming Soon)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengajuan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-md transition-all duration-200 hover:border-primary/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">
                        {request.id}
                      </span>
                      <h3 className="font-semibold">{request.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.department} • {request.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{request.amount}</span>
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
