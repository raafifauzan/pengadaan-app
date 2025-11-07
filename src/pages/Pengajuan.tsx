import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, FileText, ChevronsUpDown } from "lucide-react";
import { RequestForm } from "@/components/RequestForm";
import { useToast } from "@/hooks/use-toast";
import { usePengajuan, useUpdatePengajuan } from "@/hooks/usePengajuan";
import { useCreateFormEvaluasi, useFormEvaluasi } from "@/hooks/useFormEvaluasi";
import { supabase } from "@/integrations/supabase/client";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { data: formEvaluasiData } = useFormEvaluasi();
  const updatePengajuan = useUpdatePengajuan();
  const createFormEvaluasi = useCreateFormEvaluasi();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    id: string;
  }>({ open: false, type: "approve", id: "" });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });
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

  const generateKodeForm = () => {
    const now = new Date();
    const month = now.toLocaleString('id-ID', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    
    // Get the highest number from existing forms
    const existingNumbers = formEvaluasiData?.map(form => {
      const match = form.kode_form.match(/^(\d+)\//);
      return match ? parseInt(match[1]) : 0;
    }) || [];
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    
    return `${paddedNumber}/FORM-EV/PENG/${month}/${year}`;
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

    let createdFormId: string | null = null;
    let kodeForm: string | null = null;

    try {
      if (confirmDialog.type === "approve") {
        kodeForm = generateKodeForm();
        const createdForm = await createFormEvaluasi.mutateAsync({
          kode_form: kodeForm,
          pengajuan_id: confirmDialog.id,
          is_final: false,
        });
        createdFormId = createdForm?.id ?? null;

        await updatePengajuan.mutateAsync({
          id: confirmDialog.id,
          updates: {
            status: "approved",
            catatan: null,
            qc_at: new Date().toISOString(),
          },
        });

        toast({
          title: "Pengajuan Disetujui",
          description: `Pengajuan telah disetujui dan form evaluasi ${kodeForm} telah dibuat`,
        });
      } else {
        await updatePengajuan.mutateAsync({
          id: confirmDialog.id,
          updates: {
            status: "rejected",
            catatan: rejectReason,
            qc_at: new Date().toISOString(),
          },
        });

        toast({
          title: "Pengajuan Ditolak",
          description: `Pengajuan ditolak: ${rejectReason}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (confirmDialog.type === "approve" && createdFormId) {
        try {
          await supabase.from("form_evaluasi").delete().eq("id", createdFormId);
        } catch {
          // swallow cleanup failure but surface original error to user
        }
      }

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

  const normalizeStatus = (status: string | null | undefined): ProcurementStatus => {
    if (!status) return "pending";
    const normalized = status.toLowerCase();

    if (["approved", "disetujui"].includes(normalized)) return "approved";
    if (["pending", "menunggu"].includes(normalized)) return "pending";
    if (["rejected", "ditolak"].includes(normalized)) return "rejected";
    if (["in_progress", "dalam_proses"].includes(normalized)) return "in_progress";
    if (["completed", "selesai"].includes(normalized)) return "completed";

    return "pending";
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
                  <TableHead className="w-[120px] px-3">
                    <button onClick={() => handleSort("tgl_surat")} className="flex items-center gap-1 hover:text-foreground">
                      Tanggal <ChevronsUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[250px] px-3">
                    <button onClick={() => handleSort("judul")} className="flex items-center gap-1 hover:text-foreground">
                      Paket Pengajuan <ChevronsUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[140px] px-3">
                    <button onClick={() => handleSort("nilai_pengajuan")} className="flex items-center gap-1 hover:text-foreground">
                      Nilai Project <ChevronsUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[140px] px-3">
                    <button onClick={() => handleSort("jenis")} className="flex items-center gap-1 hover:text-foreground">
                      Jenis Project <ChevronsUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[160px] px-3 text-center">Status &amp; Aksi</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => {
                const normalizedStatus = normalizeStatus(request.status);
                const showPendingActions = normalizedStatus === "pending";

                return (
                  <TableRow 
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setDetailDialog({ open: true, data: request })}
                  >
                    <TableCell className="text-sm px-3 py-2">
                      {request.tgl_surat ? new Date(request.tgl_surat).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : "-"}
                    </TableCell>
                    <TableCell className="w-[300px] max-w-[260px] text-sm whitespace-normal break-words px-3 py-2">
                      <div>
                        <div className="">
                          {request.judul || "Tanpa Judul"}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {request.lampiran_url && (request.no_surat || request.lampiran_url) ? (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                            >
                              <a
                                href={request.lampiran_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 no-underline text-primary"
                              >
                                {request.no_surat || request.lampiran_url.split("/").pop()}
                              </a>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5">
                              {request.no_surat || "-"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm px-3 py-2">
                      Rp {request.nilai_pengajuan?.toLocaleString("id-ID") || 0}
                    </TableCell>
                    <TableCell className="text-sm px-3 py-2">
                      {request.jenis || "-"}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {showPendingActions ? (
                        <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(request.id)}
                            className="h-6 px-2.5 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-600 hover:border-emerald-200 text-[10px] font-semibold gap-1"
                          >
                          <Check className="h-2.5 w-2.5" />
                          <span className="leading-none">Approve</span>
                        </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(request.id)}
                            className="h-6 px-2.5 rounded-full border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive hover:border-destructive/20 text-[10px] font-semibold gap-1"
                          >
                          <X className="h-2.5 w-2.5" />
                          <span className="leading-none">Tolak</span>
                          </Button>
                        </div>
                      ) : (
                        <StatusBadge status={normalizedStatus} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan</DialogTitle>
          </DialogHeader>
          {detailDialog.data && (
            <Card>
              <CardContent className="pt-6 space-y-5 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">No Surat</p>
                    <p className="text-sm text-foreground">{detailDialog.data.no_surat || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <StatusBadge status={normalizeStatus(detailDialog.data.status) || "pending"} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Judul</p>
                    <p className="text-sm text-foreground">{detailDialog.data.judul || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Bagian/Unit</p>
                    <p className="text-sm text-foreground">{detailDialog.data.unit || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Jenis</p>
                    <p className="text-sm text-foreground">{detailDialog.data.jenis || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Nilai Pengajuan</p>
                    <p className="text-sm text-primary">{formatCurrency(detailDialog.data.nilai_pengajuan)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Tanggal Surat</p>
                    <p className="text-sm text-foreground">
                      {detailDialog.data.tgl_surat ? new Date(detailDialog.data.tgl_surat).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                  {detailDialog.data.email && (
                    <div className="space-y-1.5 md:col-span-2">
                      <p className="text-xs text-muted-foreground">Email Pengaju</p>
                      <p className="text-sm text-foreground">{detailDialog.data.email}</p>
                    </div>
                  )}
                  {detailDialog.data.catatan && (
                    <div className="space-y-1.5 md:col-span-2">
                      <p className="text-xs text-muted-foreground">Catatan</p>
                      <p className="text-sm text-foreground">{detailDialog.data.catatan}</p>
                    </div>
                  )}
                  <div className="space-y-1.5 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Lampiran</p>
                    <div>
                      {detailDialog.data.lampiran_url ? (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                        >
                          <a
                            href={detailDialog.data.lampiran_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 no-underline text-primary"
                          >
                            <FileText className="h-3 w-3" />
                            {detailDialog.data.no_surat || detailDialog.data.lampiran_url.split("/").pop()}
                          </a>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5"
                        >
                          Tidak ada lampiran
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

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
