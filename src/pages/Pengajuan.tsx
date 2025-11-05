import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, FileText, ArrowUpDown } from "lucide-react";
import { RequestForm } from "@/components/RequestForm";
import { useToast } from "@/hooks/use-toast";
import { usePengajuan, useUpdatePengajuan } from "@/hooks/usePengajuan";
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
  const { data: pengajuanData, isLoading } = usePengajuan();
  const updatePengajuan = useUpdatePengajuan();
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const itemsPerPage = 10;

  const handleApprove = (id: string) => {
    setConfirmDialog({ open: true, type: "approve", id });
  };

  const handleReject = (id: string) => {
    setRejectReason("");
    setConfirmDialog({ open: true, type: "reject", id });
  };

  const confirmAction = async () => {
    if (confirmDialog.type === "reject" && !rejectReason.trim()) {
      toast({
        title: "Alasan Diperlukan",
        description: "Mohon masukkan alasan penolakan",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePengajuan.mutateAsync({
        id: confirmDialog.id,
        updates: {
          status: confirmDialog.type === "approve" ? "approved" : "rejected",
          catatan: confirmDialog.type === "reject" ? rejectReason : null,
          qc_at: new Date().toISOString(),
        },
      });

      if (confirmDialog.type === "approve") {
        toast({
          title: "Pengajuan Disetujui",
          description: `Pengajuan telah disetujui`,
        });
      } else {
        toast({
          title: "Pengajuan Ditolak",
          description: `Pengajuan ditolak: ${rejectReason}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui status pengajuan",
        variant: "destructive",
      });
    }

    setConfirmDialog({ open: false, type: "approve", id: "" });
    setRejectReason("");
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter, sort and pagination logic
  const sortedAndFilteredRequests = useMemo(() => {
    if (!pengajuanData) return [];
    
    let filtered = pengajuanData.filter((req) => {
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      const matchesSearch =
        (req.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (req.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesStatus && matchesSearch;
    });

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [pengajuanData, filterStatus, searchQuery, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredRequests.length / itemsPerPage);
  const paginatedRequests = sortedAndFilteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Approval</h1>
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
                <TableHead className="w-[140px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("no_surat")} className="h-8 px-2">
                    No Surat <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[540px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("judul")} className="h-8 px-2">
                    Judul <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("unit")} className="h-8 px-2">
                    Bagian/Unit <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("jenis")} className="h-8 px-2">
                    Jenis <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[130px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("nilai_pengajuan")} className="h-8 px-2">
                    Nilai <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("tgl_surat")} className="h-8 px-2">
                    Tanggal <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px]">Lampiran</TableHead>
                <TableHead className="w-[140px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-sm">{request.no_surat || "-"}</TableCell>
                  <TableCell className="text-sm">{request.judul || "-"}</TableCell>
                  <TableCell className="text-sm">{request.unit || "-"}</TableCell>
                  <TableCell className="text-sm">{request.jenis || "-"}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(request.nilai_pengajuan)}</TableCell>
                  <TableCell className="text-sm">
                    {request.tgl_surat ? new Date(request.tgl_surat).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status as any || "pending"} />
                  </TableCell>
                  <TableCell>
                    {request.lampiran_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={request.lampiran_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
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
