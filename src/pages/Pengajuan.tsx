import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, FileText, ChevronsUpDown } from "lucide-react";
import { RequestForm } from "@/components/RequestForm";
import { useToast } from "@/hooks/use-toast";
import { usePengajuan, useUpdatePengajuan } from "@/hooks/usePengajuan";
import { useCreateFormEvaluasi, useFormEvaluasi } from "@/hooks/useFormEvaluasi";
import { supabase } from "@/integrations/supabase/client";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ProcurementFilterBar } from "@/components/ProcurementFilterBar";

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

type TableColumnKey = "date" | "title" | "value" | "jenis" | "unit" | "status";

interface TableColumnConfig {
  key: TableColumnKey;
  label: string;
  basis: number;
  minWidth?: number;
  shrink?: number;
  align: string;
  justify: string;
  headPadding: string;
  cellPadding: string;
  sortable?: boolean;
  sortKey?: string;
}

const TABLE_COLUMNS: TableColumnConfig[] = [
  {
    key: "date",
    label: "Tanggal",
    basis: 150,
    minWidth: 120,
    align: "text-left",
    justify: "justify-start",
    headPadding: "pl-5 pr-1.5",
    cellPadding: "pl-5 pr-1.5",
    sortable: true,
    sortKey: "tgl_surat",
  },
  {
    key: "title",
    label: "Paket Pengajuan",
    basis: 350,
    minWidth: 300,
    align: "text-left",
    justify: "justify-start",
    headPadding: "px-1.5",
    cellPadding: "px-1.5",
    sortable: true,
    sortKey: "judul",
  },
  {
    key: "value",
    label: "Nilai Project",
    basis: 180,
    align: "text-right",
    justify: "justify-end",
    headPadding: "px-0",
    cellPadding: "px-2.5",
    sortable: true,
    sortKey: "nilai_pengajuan",
  },
  {
    key: "jenis",
    label: "Jenis Project",
    basis: 170,
    minWidth: 150,
    align: "text-center",
    justify: "justify-center",
    headPadding: "px-1.5",
    cellPadding: "px-1.5",
    sortable: true,
    sortKey: "jenis",
  },
  {
    key: "unit",
    label: "Bagian / Unit",
    basis: 150,
    minWidth: 140,
    align: "text-center",
    justify: "justify-center",
    headPadding: "px-1.5",
    cellPadding: "px-1.5",
    sortable: true,
    sortKey: "unit",
  },
  {
    key: "status",
    label: "Status & Aksi",
    basis: 140,
    minWidth: 140,
    align: "text-center",
    justify: "justify-center",
    headPadding: "px-1.5",
    cellPadding: "px-1.5",
  },
];

const getColumnFlexStyles = (column: TableColumnConfig) => ({
  flexBasis: `${column.basis}px`,
  flexGrow: 0,
  flexShrink: column.shrink ?? 0,
  minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
});

export default function Pengajuan() {
  const { toast } = useToast();
  const { data: pengajuanData, isLoading } = usePengajuan();
  const { data: formEvaluasiData } = useFormEvaluasi();
  const updatePengajuan = useUpdatePengajuan();
  const createFormEvaluasi = useCreateFormEvaluasi();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nilaiFilter, setNilaiFilter] = useState<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
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

  const nilaiRange = useMemo(() => {
    const source = pengajuanData && pengajuanData.length > 0 ? pengajuanData : mockRequests;
    if (!source.length) return { min: 0, max: 0 };
    const values = source.map((item) => item.nilai_pengajuan ?? item.amount ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max: min === max ? min + 1 : max };
  }, [pengajuanData]);

  useEffect(() => {
    setNilaiFilter([nilaiRange.min, nilaiRange.max]);
  }, [nilaiRange.min, nilaiRange.max]);

  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    (pengajuanData ?? mockRequests).forEach((item) => {
      if (item.jenis) set.add(item.jenis);
    });
    return ["all", ...Array.from(set)];
  }, [pengajuanData]);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    (pengajuanData ?? mockRequests).forEach((item) => {
      if (item.unit) set.add(item.unit);
    });
    return ["all", ...Array.from(set)];
  }, [pengajuanData]);

  // Filter, sort and pagination logic
  const sortedAndFilteredRequests = useMemo(() => {
    if (!pengajuanData) return [];

    const isNilaiFilterActive = nilaiFilter[1] !== Number.MAX_SAFE_INTEGER;

    let filtered = pengajuanData.filter((req) => {
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      const matchesJenis =
        filterJenis === "all" ||
        (req.jenis?.toLowerCase() ?? "") === filterJenis.toLowerCase();
      const matchesUnit =
        filterUnit === "all" ||
        (req.unit?.toLowerCase() ?? "") === filterUnit.toLowerCase();
      const matchesSearch =
        (req.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (req.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const nilai = req.nilai_pengajuan ?? 0;
      const matchesNilai =
        !isNilaiFilterActive || (nilai >= nilaiFilter[0] && nilai <= nilaiFilter[1]);
      return matchesStatus && matchesJenis && matchesUnit && matchesSearch && matchesNilai;
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
  }, [pengajuanData, filterJenis, filterStatus, filterUnit, nilaiFilter, searchQuery, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredRequests.length / itemsPerPage);
  const paginatedRequests = sortedAndFilteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderCellContent = (request: any, columnKey: TableColumnKey) => {
    switch (columnKey) {
      case "date":
        return request.tgl_surat
          ? new Date(request.tgl_surat)
              .toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
              .replace(".", "")
          : "-";
      case "title":
        return (
          <div className="max-w-full">
            <div>{request.judul || "Tanpa Judul"}</div>
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
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5"
                >
                  {request.no_surat || "-"}
                </Badge>
              )}
            </div>
          </div>
        );
      case "value":
        return `Rp ${request.nilai_pengajuan?.toLocaleString("id-ID") || 0}`;
      case "jenis":
        return request.jenis || "-";
      case "unit":
        return request.unit || "-";
      case "status": {
        const normalizedStatus = normalizeStatus(request.status);
        const showPendingActions = normalizedStatus === "pending";

        return showPendingActions ? (
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
        );
      }
      default:
        return null;
    }
  };

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

      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
          onSubmit={async (values) => {
            try {
              const { error } = await supabase.from("pengajuan").insert({
                no_surat: values.noSurat,
                judul: values.judul,
                jenis: values.jenis,
                unit: values.unit,
                nilai_pengajuan: values.nilaiPengajuan,
                tgl_surat: values.tglSurat,
                email: values.email,
                catatan: values.catatan,
                lampiran_url: values.lampiranUrl,
                status: "pending",
              });

              if (error) throw error;

              toast({
                title: "Berhasil",
                description: "Pengajuan berhasil dibuat",
              });
              setShowForm(false);
            } catch (error) {
              console.error(error);
              toast({
                title: "Gagal",
                description: "Gagal membuat pengajuan",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      <ProcurementFilterBar
        searchPlaceholder="Cari berdasarkan No Surat, Judul, atau Requestor..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={[
          { value: "all", label: "Semua Status" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Disetujui" },
          { value: "rejected", label: "Ditolak" },
          { value: "in_progress", label: "Dalam Proses" },
        ]}
        statusValue={filterStatus}
        onStatusChange={setFilterStatus}
        jenisOptions={jenisOptions.map((value) => ({
          value,
          label: value === "all" ? "Semua Jenis" : value,
        }))}
        jenisValue={filterJenis}
        onJenisChange={setFilterJenis}
        unitOptions={unitOptions.map((value) => ({
          value,
          label: value === "all" ? "Semua Unit" : value,
        }))}
        unitValue={filterUnit}
        onUnitChange={setFilterUnit}
        nilaiRange={[nilaiRange.min, nilaiRange.max]}
        nilaiValue={nilaiFilter}
        onNilaiChange={setNilaiFilter}
      />

      {/* Table */}

      <div className="bg-card rounded-lg border overflow-hidden">

        <div role="table" className="w-full">

          <div role="rowgroup" className="border-b bg-muted/20">

            <div role="row" className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80">

              {TABLE_COLUMNS.map((column) => (
                <div
                  role="columnheader"
                  key={`head-${column.key}`}
                  className={`${column.align} ${column.justify} ${column.headPadding} py-2 flex items-center`}
                  style={getColumnFlexStyles(column)}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.sortKey ?? column.key)}
                      className={`flex w-full items-center gap-[2px] hover:text-foreground ${column.justify}`}
                    >
                      {column.label}
                      <ChevronsUpDown className="h-2.5 w-2.5 text-muted-foreground/80" />
                    </button>
                  ) : (
                    <div className={`flex w-full items-center ${column.justify}`}>{column.label}</div>
                  )}
                </div>
              ))}

            </div>

          </div>

          <div role="rowgroup">

            {paginatedRequests.map((request) => (

              <div

                role="row"

                key={request.id}

                className="flex items-center gap-2.5 border-b last:border-b-0 text-sm cursor-pointer hover:bg-muted/50"

                onClick={() => setDetailDialog({ open: true, data: request })}

              >

                {TABLE_COLUMNS.map((column) => (
                  <div
                    role="cell"
                    key={`${request.id}-${column.key}`}
                    className={`${column.align} ${column.justify} ${column.cellPadding} py-2 flex items-center`}
                    style={getColumnFlexStyles(column)}
                  >
                    {renderCellContent(request, column.key)}
                  </div>
                ))}

              </div>

            ))}

            {paginatedRequests.length === 0 && (

              <div className="p-6 text-center text-sm text-muted-foreground">Tidak ada data.</div>

            )}

          </div>

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
            <div className="space-y-5 text-sm">
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
                    {detailDialog.data.tgl_surat
                      ? new Date(detailDialog.data.tgl_surat).toLocaleDateString("id-ID")
                      : "-"}
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
            </div>
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




