import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, FileText } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";

type ProcurementStatus = "pending" | "approved" | "rejected" | "in_progress" | "completed";

interface ProcurementRequest {
  id: string;
  noSurat: string;
  title: string;
  department: string;
  requestor: string;
  jenisPengajuan: string;
  amount: number;
  date: string;
  status: ProcurementStatus;
  lampiran?: string;
}

const mockRequests: ProcurementRequest[] = [
  {
    id: "REQ-001",
    noSurat: "116/MEMO/TRS/IX/2025",
    title: "Pengadaan Laptop",
    department: "IT",
    requestor: "john.doe@company.com",
    jenisPengajuan: "Barang",
    amount: 50000000,
    date: "2024-01-15",
    status: "pending",
    lampiran: "surat_pengajuan_001.pdf",
  },
  {
    id: "REQ-002",
    noSurat: "117/MEMO/GA/IX/2025",
    title: "Alat Tulis Kantor",
    department: "GA",
    requestor: "jane.smith@company.com",
    jenisPengajuan: "Barang",
    amount: 5000000,
    date: "2024-01-14",
    status: "approved",
    lampiran: "surat_pengajuan_002.pdf",
  },
  {
    id: "REQ-003",
    noSurat: "118/MEMO/MKT/IX/2025",
    title: "Peralatan Meeting",
    department: "Marketing",
    requestor: "bob.wilson@company.com",
    jenisPengajuan: "Barang",
    amount: 15000000,
    date: "2024-01-13",
    status: "rejected",
    lampiran: "surat_pengajuan_003.pdf",
  },
  {
    id: "REQ-004",
    noSurat: "119/MEMO/IT/IX/2025",
    title: "Software License",
    department: "IT",
    requestor: "alice.brown@company.com",
    jenisPengajuan: "Jasa",
    amount: 25000000,
    date: "2024-01-12",
    status: "pending",
    lampiran: "surat_pengajuan_004.pdf",
  },
  {
    id: "REQ-005",
    noSurat: "120/MEMO/FIN/IX/2025",
    title: "Audit Services",
    department: "Finance",
    requestor: "charlie.davis@company.com",
    jenisPengajuan: "Jasa",
    amount: 35000000,
    date: "2024-01-11",
    status: "in_progress",
    lampiran: "surat_pengajuan_005.pdf",
  },
];

export default function Pengajuan() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    id: string;
  }>({ open: false, type: "approve", id: "" });
  const [rejectReason, setRejectReason] = useState("");

  const itemsPerPage = 10;

  const handleApprove = (id: string) => {
    setConfirmDialog({ open: true, type: "approve", id });
  };

  const handleReject = (id: string) => {
    setRejectReason("");
    setConfirmDialog({ open: true, type: "reject", id });
  };

  const confirmAction = () => {
    if (confirmDialog.type === "reject" && !rejectReason.trim()) {
      toast({
        title: "Alasan Diperlukan",
        description: "Mohon masukkan alasan penolakan",
        variant: "destructive",
      });
      return;
    }

    if (confirmDialog.type === "approve") {
      toast({
        title: "Pengajuan Disetujui",
        description: `Pengajuan ${confirmDialog.id} telah disetujui`,
      });
    } else {
      toast({
        title: "Pengajuan Ditolak",
        description: `Pengajuan ${confirmDialog.id} ditolak: ${rejectReason}`,
        variant: "destructive",
      });
    }

    setConfirmDialog({ open: false, type: "approve", id: "" });
    setRejectReason("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter and pagination logic
  const filteredRequests = mockRequests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesSearch =
      req.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pengajuan & Approval</h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan setujui pengajuan pengadaan
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Pengajuan Baru
        </Button>
      </div>

      {showForm && <RequestForm onClose={() => setShowForm(false)} />}

      {/* Filter Bar */}
      <div className="bg-card rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="in_progress">Dalam Proses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Pencarian</Label>
            <Input
              placeholder="Cari berdasarkan No Surat, Judul, atau Requestor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">No Surat</TableHead>
                <TableHead className="min-w-[180px]">Judul</TableHead>
                <TableHead className="w-[120px]">Bagian/Unit</TableHead>
                <TableHead className="w-[100px]">Jenis</TableHead>
                <TableHead className="w-[130px]">Nilai</TableHead>
                <TableHead className="w-[100px]">Tanggal</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px]">Lampiran</TableHead>
                <TableHead className="w-[140px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-sm">{request.noSurat}</TableCell>
                  <TableCell className="text-sm">{request.title}</TableCell>
                  <TableCell className="text-sm">{request.department}</TableCell>
                  <TableCell className="text-sm">{request.jenisPengajuan}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(request.amount)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(request.date).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    {request.lampiran && (
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request.id)}
                          className="h-8 px-2"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          className="h-8 px-2"
                        >
                          <X className="h-3 w-3 mr-1" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Confirmation Dialogs */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "approve" ? "Konfirmasi Approval" : "Alasan Penolakan"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "approve"
                ? "Apakah Anda yakin ingin menyetujui pengajuan ini?"
                : "Mohon masukkan alasan penolakan pengajuan ini."}
            </DialogDescription>
          </DialogHeader>
          {confirmDialog.type === "reject" && (
            <div className="space-y-2">
              <Label>Alasan Penolakan *</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, type: "approve", id: "" })}
            >
              Batal
            </Button>
            <Button
              onClick={confirmAction}
              variant={confirmDialog.type === "approve" ? "default" : "destructive"}
            >
              {confirmDialog.type === "approve" ? "Ya, Setujui" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
