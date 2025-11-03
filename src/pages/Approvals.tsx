import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const pendingApprovals = [
  {
    id: "PR-002",
    title: "Pengadaan Furniture Kantor",
    description: "Meja dan kursi untuk ruang meeting baru",
    department: "General Affairs",
    requestor: "Jane Smith",
    amount: "Rp 25.000.000",
    date: "2024-03-14",
  },
  {
    id: "PR-005",
    title: "Pengadaan Printer HP LaserJet",
    description: "3 unit printer untuk lantai 2",
    department: "IT Department",
    requestor: "David Chen",
    amount: "Rp 18.000.000",
    date: "2024-03-16",
  },
];

export default function Approvals() {
  const handleApprove = (id: string) => {
    toast.success(`Pengajuan ${id} telah disetujui`);
  };

  const handleReject = (id: string) => {
    toast.error(`Pengajuan ${id} telah ditolak`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Approval Pengajuan</h1>
          <p className="text-muted-foreground">Review dan approve pengajuan procurement</p>
        </div>

        {pendingApprovals.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Tidak ada pengajuan yang perlu di-review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingApprovals.map((request) => (
              <Card
                key={request.id}
                className="shadow-md hover:shadow-xl transition-all duration-300 border-2 border-warning/30"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm px-3 py-1 bg-warning/10 text-warning rounded-md font-semibold">
                            {request.id}
                          </span>
                          <StatusBadge status="pending" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{request.title}</h3>
                          <p className="text-muted-foreground">{request.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Department: </span>
                            <span className="font-medium">{request.department}</span>
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

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleReject(request.id)}
                        variant="outline"
                        className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                      <Button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 bg-gradient-to-r from-success to-success hover:shadow-lg"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
