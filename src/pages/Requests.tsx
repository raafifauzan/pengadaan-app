import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProcurementStatus } from "@/components/StatusBadge";
import { useState } from "react";
import { RequestForm } from "@/components/RequestForm";

const mockRequests = [
  {
    id: "PR-001",
    title: "Pengadaan Laptop Dell XPS 15",
    description: "15 unit laptop untuk tim development",
    department: "IT Department",
    requestor: "John Doe",
    amount: "Rp 45.000.000",
    status: "approved" as ProcurementStatus,
    date: "2024-03-15",
  },
  {
    id: "PR-002",
    title: "Pengadaan Furniture Kantor",
    description: "Meja dan kursi untuk ruang meeting baru",
    department: "General Affairs",
    requestor: "Jane Smith",
    amount: "Rp 25.000.000",
    status: "pending" as ProcurementStatus,
    date: "2024-03-14",
  },
  {
    id: "PR-003",
    title: "Pengadaan Software Lisensi",
    description: "Lisensi Adobe Creative Cloud untuk tim design",
    department: "IT Department",
    requestor: "Mike Johnson",
    amount: "Rp 15.000.000",
    status: "in_progress" as ProcurementStatus,
    date: "2024-03-13",
  },
  {
    id: "PR-004",
    title: "Pengadaan AC Unit",
    description: "5 unit AC untuk lantai 3",
    department: "Facility Management",
    requestor: "Sarah Williams",
    amount: "Rp 35.000.000",
    status: "completed" as ProcurementStatus,
    date: "2024-03-10",
  },
];

export default function Requests() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pengajuan Procurement</h1>
            <p className="text-muted-foreground">Kelola semua pengajuan procurement</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Pengajuan Baru
          </Button>
        </div>

        {showForm && (
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle>Form Pengajuan Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestForm onClose={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {mockRequests.map((request) => (
            <Card
              key={request.id}
              className="shadow-md hover:shadow-xl transition-all duration-300 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm px-3 py-1 bg-muted rounded-md">
                        {request.id}
                      </span>
                      <StatusBadge status={request.status} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{request.title}</h3>
                      <p className="text-muted-foreground">{request.description}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Department: </span>
                        <span className="font-medium">{request.department}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pengaju: </span>
                        <span className="font-medium">{request.requestor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tanggal: </span>
                        <span className="font-medium">{request.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{request.amount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
