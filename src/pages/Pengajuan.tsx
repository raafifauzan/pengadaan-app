import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import { RequestForm } from "@/components/RequestForm";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";

type ProcurementStatus = "pending" | "approved" | "rejected" | "in_progress" | "completed";

interface ProcurementRequest {
  id: string;
  title: string;
  department: string;
  requestor: string;
  amount: number;
  status: ProcurementStatus;
  date: string;
}

const mockRequests: ProcurementRequest[] = [
  {
    id: "REQ-001",
    title: "Pengadaan Laptop",
    department: "IT",
    requestor: "John Doe",
    amount: 25000000,
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "REQ-002",
    title: "Furniture Kantor",
    department: "GA",
    requestor: "Jane Smith",
    amount: 15000000,
    status: "pending",
    date: "2024-01-16",
  },
  {
    id: "REQ-003",
    title: "Peralatan Meeting",
    department: "Marketing",
    requestor: "Bob Johnson",
    amount: 8000000,
    status: "approved",
    date: "2024-01-14",
  },
  {
    id: "REQ-004",
    title: "Software License",
    department: "IT",
    requestor: "Alice Brown",
    amount: 12000000,
    status: "rejected",
    date: "2024-01-13",
  },
];

export default function Pengajuan() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    toast({
      title: "Pengajuan Disetujui",
      description: `Pengajuan ${id} telah disetujui.`,
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "Pengajuan Ditolak",
      description: `Pengajuan ${id} telah ditolak.`,
      variant: "destructive",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengajuan & Approval</h1>
          <p className="text-muted-foreground mt-1">
            Kelola pengajuan procurement dan approval
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Pengajuan Baru
        </Button>
      </div>

      {showForm && (
        <RequestForm onClose={() => setShowForm(false)} />
      )}

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Requestor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.department}</TableCell>
                <TableCell>{request.requestor}</TableCell>
                <TableCell>{formatCurrency(request.amount)}</TableCell>
                <TableCell>{new Date(request.date).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "pending" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
