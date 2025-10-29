import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProcurementStatus } from "@/components/StatusBadge";

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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
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
