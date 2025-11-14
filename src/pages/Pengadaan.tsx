import { useEffect, useMemo, useState } from "react";
import { Settings, PenLine, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProcurementFilterBar } from "@/components/ProcurementFilterBar";
import { DataTable } from "@/components/DataTable";
import {
  PENGADAAN_TABLE_COLUMNS,
  type PengadaanColumnKey,
  type TableColumnConfig,
} from "@/config/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  usePengadaan,
  useUpdatePengadaan,
  type PengadaanWithRelations,
} from "@/hooks/usePengadaan";
import { StatusBadge } from "@/components/StatusBadge";
import type { ProcurementStatus as ProcurementStatusType } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useSaveTahapPengadaan,
  useTahapPengadaan,
  useTemplateTahapan,
} from "@/hooks/useTahapanPengadaan";

const formatStatusLabel = (status: string) => {
  if (!status) return "-";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const normalizeProcurementStatus = (
  status?: string | null
): ProcurementStatusType => {
  if (!status) return "pending";
  const normalized = status
    .toLowerCase()
    .replace(/\s+/g, "_") as ProcurementStatusType;
  const allowed: ProcurementStatusType[] = [
    "pending",
    "approved",
    "rejected",
    "in_progress",
    "completed",
    "pending_evaluation",
    "evaluated",
    "waiting_po",
    "po_issued",
    "in_delivery",
  ];
  return allowed.includes(normalized) ? normalized : "pending";
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  try {
    return new Date(value)
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(".", "");
  } catch {
    return value;
  }
};

const formatNumberId = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

type TahapanFormValue = {
  templateId: string;
  namaTahap: string;
  deskripsi?: string | null;
  urutan: number;
  tanggal: string;
  catatan: string;
};

export default function Pengadaan() {
  const { toast } = useToast();
  const { data: pengadaanData, isLoading } = usePengadaan();
  const { mutateAsync: updatePengadaan, isPending: isUpdating } =
    useUpdatePengadaan();
  const { mutateAsync: saveTahapan, isPending: isSavingTahapan } =
    useSaveTahapPengadaan();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMetode, setFilterMetode] = useState<string>("all");
  const [nilaiFilter, setNilaiFilter] = useState<[number, number]>([0, 0]); // belum dipakai
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    columnKey: PengadaanColumnKey;
    sortKey: string;
    direction: "asc" | "desc";
  } | null>(null);

  const itemsPerPage = 10;

  // sementara masih dummy (belum dipakai untuk filter slider)
  const nilaiRange = useMemo(() => ({ min: 0, max: 0 }), []);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    (pengadaanData ?? []).forEach((item) => {
      if (item.status_pengadaan) set.add(item.status_pengadaan);
    });

    return [
      { value: "all", label: "Semua Status" },
      ...Array.from(set).map((value) => ({
        value,
        label: formatStatusLabel(value),
      })),
    ];
  }, [pengadaanData]);

  const metodeOptions = useMemo(() => {
    const set = new Set<string>();
    (pengadaanData ?? []).forEach((item) => {
      const label =
        (item.metode_nama && item.metode_nama.trim()) ||
        (item.metode_id && item.metode_id.trim());
      if (label) set.add(label);
    });

    return [
      { value: "all", label: "Semua Metode" },
      ...Array.from(set).map((value) => ({
        value,
        label: value,
      })),
    ];
  }, [pengadaanData]);

  const statusChoices = useMemo(() => {
    const filtered = statusOptions.filter((opt) => opt.value !== "all");
    if (filtered.length > 0) return filtered;
    const defaults = ["draft", "proses", "selesai"];
    return defaults.map((value) => ({
      value,
      label: formatStatusLabel(value),
    }));
  }, [statusOptions]);

  const metodeChoices = useMemo(() => {
    const map = new Map<string, string>();
    (pengadaanData ?? []).forEach((item) => {
      if (item.metode_id) {
        map.set(
          item.metode_id,
          (item.metode_nama && item.metode_nama.trim()) || item.metode_id
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [pengadaanData]);

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    row: PengadaanWithRelations | null;
  }>({
    open: false,
    row: null,
  });
  const [editForm, setEditForm] = useState({
    status: "",
    metodeId: "",
  });
  const [tahapanForm, setTahapanForm] = useState<TahapanFormValue[]>([]);
  const [tahapanDirty, setTahapanDirty] = useState(false);
  const [isSwitchingMetode, setIsSwitchingMetode] = useState(false);
  const [lockedMetodeByPengadaan, setLockedMetodeByPengadaan] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(true);

  const selectedMetodeId =
    editDialog.open && editForm.metodeId ? editForm.metodeId : undefined;
  const selectedPengadaanId = editDialog.row?.id;
  const metodeLocked =
    (selectedPengadaanId && lockedMetodeByPengadaan[selectedPengadaanId]) ?? false;
  const shouldLoadTahapan =
    editDialog.open && metodeLocked && Boolean(selectedMetodeId);
  const progressDisabled = !metodeLocked;

  const { data: templateTahapan, isLoading: isTemplateLoading } =
    useTemplateTahapan(selectedMetodeId, shouldLoadTahapan);
  const { data: existingTahapan, isLoading: isTahapLoading } =
    useTahapPengadaan(selectedPengadaanId, shouldLoadTahapan);

  useEffect(() => {
    if (!editDialog.open) return;
    if (!templateTahapan) {
      setTahapanForm([]);
      setIsSwitchingMetode(false);
      return;
    }
    if (tahapanDirty) return;

    const nextValues: TahapanFormValue[] = templateTahapan.map(
      (template, index) => {
        const existing = existingTahapan?.find(
          (item) =>
            item.urutan === template.urutan ||
            item.nama_tahap === template.nama_tahap
        );

        return {
          templateId: template.id,
          namaTahap: template.nama_tahap,
          deskripsi: template.deskripsi,
          urutan: template.urutan ?? index + 1,
          tanggal: existing?.tanggal_tahap
            ? existing.tanggal_tahap.slice(0, 10)
            : "",
          catatan: existing?.catatan ?? "",
        };
      }
    );

    setTahapanForm(nextValues);
    setIsSwitchingMetode(false);
  }, [templateTahapan, existingTahapan, editDialog.open, tahapanDirty]);

  useEffect(() => {
    if (!editDialog.open) {
      setTahapanForm([]);
      setTahapanDirty(false);
      setIsSwitchingMetode(false);
      setDetailOpen(true);
    }
  }, [editDialog.open]);

  const handleSort = (col: TableColumnConfig<PengadaanColumnKey>) => {
    if (!col.sortable) return;
    const sortKey = (col.sortKey ?? col.key) as string;

    setSortConfig((prev) => {
      if (prev && prev.columnKey === col.key) {
        return {
          columnKey: col.key,
          sortKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { columnKey: col.key, sortKey, direction: "asc" };
    });
  };

  const filteredPengadaan: PengadaanWithRelations[] = useMemo(() => {
    if (!pengadaanData) return [];

    let result = (pengadaanData as PengadaanWithRelations[]).filter((item) => {
      const metodeLabel =
        (item.metode_nama && item.metode_nama.trim()) ||
        (item.metode_id && item.metode_id.trim()) ||
        "";

      const matchesStatus =
        filterStatus === "all" ||
        (item.status_pengadaan ?? "")
          .toLowerCase()
          .includes(filterStatus.toLowerCase());

      const matchesMetode =
        filterMetode === "all" ||
        metodeLabel.toLowerCase() === filterMetode.toLowerCase();

      const search = searchQuery.toLowerCase();
      const matchesSearch =
        (item.pengajuan_judul ?? "").toLowerCase().includes(search) ||
        (item.form_evaluasi_kode ?? "").toLowerCase().includes(search) ||
        (item.pengajuan_jenis ?? "").toLowerCase().includes(search) ||
        metodeLabel.toLowerCase().includes(search);

      return matchesStatus && matchesMetode && matchesSearch;
    });

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const { columnKey, sortKey, direction } = sortConfig;

        if (columnKey === "tanggal_pengajuan") {
          const aTime = a.pengajuan_tanggal
            ? new Date(a.pengajuan_tanggal).getTime()
            : 0;
          const bTime = b.pengajuan_tanggal
            ? new Date(b.pengajuan_tanggal).getTime()
            : 0;
          return direction === "asc" ? aTime - bTime : bTime - aTime;
        }

        const aVal = (a as any)[sortKey];
        const bVal = (b as any)[sortKey];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return direction === "asc" ? -1 : 1;
        if (aStr > bStr) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [pengadaanData, filterStatus, filterMetode, searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredPengadaan.length / itemsPerPage);
  const paginatedPengadaan = filteredPengadaan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateTahapanValue = (
    templateId: string,
    field: "tanggal" | "catatan",
    value: string
  ) => {
    setTahapanDirty(true);
    setTahapanForm((prev) =>
      prev.map((item) =>
        item.templateId === templateId ? { ...item, [field]: value } : item
      )
    );
  };

  const openEditDialog = (row: PengadaanWithRelations) => {
    setEditDialog({ open: true, row });
    setEditForm({
      status: row.status_pengadaan ?? statusChoices[0]?.value ?? "draft",
      metodeId: row.metode_id ?? metodeChoices[0]?.value ?? "",
    });
    setTahapanDirty(false);
    setTahapanForm([]);
    setIsSwitchingMetode(false);
  };

  const closeProgressDialog = () => {
    setEditDialog({ open: false, row: null });
    setTahapanForm([]);
    setTahapanDirty(false);
    setIsSwitchingMetode(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeProgressDialog();
    }
  };

  const handleLockMetode = () => {
    if (!editDialog.row || !editForm.metodeId || metodeLocked) return;
    setLockedMetodeByPengadaan((prev) => ({
      ...prev,
      [editDialog.row!.id]: true,
    }));
    setIsSwitchingMetode(true);
    toast({
      title: "Metode ditetapkan",
      description: "Metode pengadaan dikunci untuk pengadaan ini.",
    });
  };

  const canSubmit = Boolean(editForm.status && editForm.metodeId);
  const isProgressLoading =
    shouldLoadTahapan && (isTemplateLoading || isTahapLoading);
  const isProgressTransition =
    shouldLoadTahapan && (isProgressLoading || isSwitchingMetode);
  const isSaving = isUpdating || isSavingTahapan;
  const currentRowStatus = normalizeProcurementStatus(
    editDialog.row?.status_pengadaan
  );

  const handleSaveProgress = async () => {
    if (!editDialog.row) return;

    const tasks: Promise<unknown>[] = [];
    const shouldUpdatePengadaan =
      editDialog.row.status_pengadaan !== editForm.status ||
      editDialog.row.metode_id !== editForm.metodeId;

    if (shouldUpdatePengadaan) {
      tasks.push(
        updatePengadaan({
          id: editDialog.row.id,
          updates: {
            status_pengadaan: editForm.status,
            metode_id: editForm.metodeId,
          },
        })
      );
    }

    const shouldSyncTahapan =
      (templateTahapan && templateTahapan.length > 0) ||
      (existingTahapan?.length ?? 0) > 0;

    if (shouldSyncTahapan && editDialog.row) {
      tasks.push(
        saveTahapan({
          pengadaanId: editDialog.row.id,
          tahapan: (templateTahapan ?? []).map((template, index) => {
            const draft = tahapanForm.find(
              (item) => item.templateId === template.id
            );
            const fallbackIndex = template.urutan ?? index + 1;
            return {
              nama_tahap: template.nama_tahap,
              urutan: draft?.urutan ?? fallbackIndex,
              tanggal_tahap: draft?.tanggal || null,
              catatan: draft?.catatan || null,
            };
          }),
        })
      );
    }

    if (tasks.length === 0) {
      toast({
        title: "Tidak ada perubahan",
        description: "Belum ada data yang disesuaikan pada dialog ini.",
      });
      closeProgressDialog();
      return;
    }

    try {
      await Promise.all(tasks);
      toast({
        title: "Pengadaan diperbarui",
        description: "Progress dokumen dan metode berhasil disimpan.",
      });
      closeProgressDialog();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui pengadaan.",
      });
    }
  };

  const renderCell = (row: PengadaanWithRelations, col: PengadaanColumnKey) => {
    switch (col) {
      case "tanggal_pengajuan":
        return (
          <span className="text-sm text-foreground">
            {formatDate(row.pengajuan_tanggal ?? row.created_at)}
          </span>
        );

      case "paket_pengajuan": {
        const feText = row.form_evaluasi_kode ?? row.kode_form;
        const hasLampiran = !!row.pengajuan_lampiran_url;

        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground">
              {row.pengajuan_judul ?? "-"}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {hasLampiran ? (
                <a
                  href={row.pengajuan_lampiran_url!}
                  target="_blank"
                  rel="noreferrer"
                  title="Buka lampiran Form Evaluasi"
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-800"
                >
                  {feText}
                </a>
              ) : (
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-medium text-blue-700">
                  {feText}
                </span>
              )}
            </div>
          </div>
        );
      }

      case "jenis":
        return (
          <span className="text-sm text-foreground">
            {row.pengajuan_jenis ?? "-"}
          </span>
        );

      case "metode": {
        const label =
          (row.metode_nama && row.metode_nama.trim()) ||
          (row.metode_id && row.metode_id.trim()) ||
          "-";
        return <span className="text-sm text-foreground">{label}</span>;
      }

      case "hps": {
        const hps = row.form_evaluasi_anggaran_hps ?? null;
        const nilaiPengajuan = row.pengajuan_nilai_pengajuan ?? null;
        const hasComparison = hps != null && nilaiPengajuan != null;
        const isHpsHigher = hasComparison ? nilaiPengajuan >= hps : null;
        const diffPercent =
          hasComparison && hps !== 0
            ? ((hps - nilaiPengajuan) / hps) * 100
            : null;

        const diffClass =
          isHpsHigher === null
            ? "text-muted-foreground"
            : isHpsHigher && diffPercent !== 0
            ? "text-emerald-600"
            : !isHpsHigher
            ? "text-red-600"
            : "text-muted-foreground";

        return (
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-foreground">
              {formatNumberId(hps)}
            </span>
            {nilaiPengajuan != null && (
              <div className="flex items-center gap-2 text-xs">
                <span className={diffClass}>
                  {formatNumberId(nilaiPengajuan)}
                </span>
                {diffPercent != null && (
                  <span className={diffClass}>
                    (
                    {diffPercent === 0
                      ? "0.0%"
                      : `${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(
                          1
                        )}%`}
                    )
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }

      case "status_aksi": {
        const status = row.status_pengadaan || "draft";
        const isDraft = status.toLowerCase() === "draft";
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isDraft ? "outline" : "secondary"}
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium",
                isDraft
                  ? "border-amber-300 text-amber-700 bg-amber-50"
                  : "bg-emerald-50 text-emerald-700"
              )}
            >
              {formatStatusLabel(status)}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground transition-colors hover:bg-muted-foreground hover:text-background"
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(row);
              }}
            >
              <PenLine className="h-3 w-3" />
            </Button>
          </div>
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center">
        <p>Memuat data pengadaan...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pengadaan</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring pengadaan berdasarkan pengajuan, form evaluasi, dan
            metode pengadaan.
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Pengaturan
        </Button>
      </div>

      {/* Filter Bar */}
      <ProcurementFilterBar
        searchPlaceholder="Cari berdasarkan nama paket, kode form, jenis, atau metode pengadaan..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={statusOptions}
        statusValue={filterStatus}
        onStatusChange={setFilterStatus}
        jenisOptions={metodeOptions}
        jenisValue={filterMetode}
        onJenisChange={setFilterMetode}
        nilaiRange={[nilaiRange.min, nilaiRange.max]}
        nilaiValue={nilaiFilter}
        onNilaiChange={setNilaiFilter}
      />

      {/* TABLE */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <div className="min-w-[900px]">
          <DataTable
            columns={PENGADAAN_TABLE_COLUMNS}
            rows={paginatedPengadaan}
            rowKey={(row) => row.id}
            renderCell={renderCell}
            sortConfig={
              sortConfig
                ? { key: sortConfig.columnKey, direction: sortConfig.direction }
                : undefined
            }
            onSortChange={handleSort}
            emptyMessage="Tidak ada data pengadaan."
            rowClassName="hover:bg-muted/40 transition-colors border-b"
            onRowDoubleClick={openEditDialog}
          />
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={editDialog.open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto text-sm">
          <DialogHeader className="border-none !border-0 pb-0 space-y-0 text-left sm:text-left mt-0 mx-0 px-0 !mt-0 !mx-0 !px-0">
            <Accordion
              type="single"
              collapsible
              defaultValue="detail"
              className="w-auto"
            >
              <AccordionItem
                value="detail"
                className="border-none !border-0 !border-b-0 data-[state=open]:border-none data-[state=open]:!border-0 data-[state=open]:!border-b-0"
              >
                <AccordionTrigger className="group flex flex-col items-start gap-2 py-0 text-left hover:no-underline [&>svg]:hidden">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-semibold leading-tight">
                      {editDialog.row?.pengajuan_judul ?? "Detail Pengadaan"}
                    </DialogTitle>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </div>

                  {editDialog.row && (
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const pillClass =
                          "inline-flex items-center rounded-full border border-muted-foreground/20 bg-muted/20 px-3 py-0.5 text-[11px] font-medium";
                        const memoLabel =
                          editDialog.row?.pengajuan_no_surat ?? "-";
                        const formLabel =
                          editDialog.row?.form_evaluasi_kode ??
                          editDialog.row?.kode_form ??
                          "-";
                        const renderPill = (label: string) =>
                          editDialog.row?.pengajuan_lampiran_url ? (
                            <a
                              href={editDialog.row.pengajuan_lampiran_url}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                pillClass,
                                "text-primary hover:bg-primary/10"
                              )}
                            >
                              {label}
                            </a>
                          ) : (
                            <span className={cn(pillClass, "text-foreground/70")}>
                              {label}
                            </span>
                          );
                        return (
                          <>
                            {renderPill(memoLabel)}
                            {renderPill(formLabel)}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </AccordionTrigger>

                {editDialog.row && (
                  <AccordionContent className="pt-4">
                    <div className="grid gap-3 text-sm md:grid-cols-[0.75fr_1.25fr]">
                      <div className="space-y-3 rounded-lg border px-2 py-2 md:px-3">
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            Nilai Project
                          </p>
                          <div className="text-foreground">
                            <p className="text-sm font-semibold">
                              {formatNumberId(
                                editDialog.row.form_evaluasi_anggaran_hps
                              )}
                            </p>
                            {(() => {
                              const hps =
                                editDialog.row.form_evaluasi_anggaran_hps;
                              const nilai =
                                editDialog.row.pengajuan_nilai_pengajuan;
                              if (hps == null || nilai == null) return null;
                              const diffPercent =
                                hps !== 0 ? ((hps - nilai) / hps) * 100 : 0;
                              const isHpsHigher = nilai >= hps;
                              const diffClass =
                                diffPercent === 0
                                  ? "text-muted-foreground"
                                  : isHpsHigher
                                  ? "text-emerald-600"
                                  : "text-red-600";
                              return (
                                <p className={cn("text-xs", diffClass)}>
                                  {formatNumberId(nilai)}{" "}
                                  <span>
                                    (
                                    {diffPercent === 0
                                      ? "0.0%"
                                      : `${
                                          diffPercent > 0 ? "+" : ""
                                        }${diffPercent.toFixed(1)}%`}
                                    )
                                  </span>
                                </p>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            Jenis Pengadaan
                          </p>
                          <p className="text-foreground">
                            {editDialog.row.pengajuan_jenis ?? "-"}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            Bagian / Unit
                          </p>
                          <p className="text-foreground">
                            {editDialog.row.pengajuan_unit ?? "-"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 rounded-lg border px-2 py-2 md:px-3">
                        <p className="text-xs text-muted-foreground">
                          Timeline Dokumen
                        </p>
                        <div className>
                          {[
                            {
                              label: "Pengajuan Masuk",
                              date: editDialog.row.pengajuan_tanggal,
                              helper:
                                editDialog.row.pengajuan_no_surat ?? undefined,
                            },
                            {
                              label: "Form Evaluasi Dibuat",
                              date: editDialog.row.form_evaluasi_created_at,
                              helper:
                                editDialog.row.form_evaluasi_kode ??
                                editDialog.row.kode_form ??
                                undefined,
                            },
                            {
                              label: "Masuk Pengadaan",
                              date: editDialog.row.created_at,
                            },
                          ]
                            .filter((item) => item.date)
                            .map((item, idx, arr) => {
                              const isLast = idx === arr.length - 1;
                              return (
                                <div
                                  key={`${item.label}-${idx}`}
                                  className="flex gap-3 text-xs"
                                >
                                  <div className="flex w-6 flex-col items-center">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                                    {!isLast && (
                                      <span className="w-px flex-1 bg-primary/30" />
                                    )}
                                  </div>
                                  <div
                                    className={cn(
                                      "flex-1 pt-0.5 ",
                                      !isLast && "pb-3"
                                    )}
                                  >
                                    <p className="font-medium text-foreground">
                                      {item.label}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {formatDate(item.date ?? null)}
                                      {item.helper ? ` · ${item.helper}` : ""}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            </Accordion>
          </DialogHeader>

          {editDialog.row && (
            <div className="space-y-6">
              <section className="space-y-4">
                <div className="space-y-2">
                  {shouldLoadTahapan && isProgressTransition && (
                    <span
                      aria-label="Memuat tahapan"
                      className="mt-1 h-3 w-24 rounded bg-muted/80 animate-pulse md:mt-0"
                    />
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <Label
                      htmlFor="metode_pengadaan_stepper"
                      className="text-xs font-semibold uppercase text-muted-foreground sm:w-30"
                    >
                      Metode Pengadaan
                    </Label>
                    {metodeChoices.length > 0 ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <Select
                          value={editForm.metodeId}
                          disabled={metodeLocked}
                          onValueChange={(value) => {
                            setEditForm((prev) => ({ ...prev, metodeId: value }));
                            setTahapanDirty(false);
                            setTahapanForm([]);
                            setIsSwitchingMetode(false);
                          }}
                        >
                          <SelectTrigger
                            id="metode_pengadaan_stepper"
                            className="w-auto sm:w-48 sm:pr-2"
                          >
                            <SelectValue placeholder="Pilih metode pengadaan" />
                          </SelectTrigger>
                          <SelectContent>
                            {metodeChoices.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant={metodeLocked ? "secondary" : "default"}
                          className="sm:min-w-[110px]"
                          disabled={metodeLocked || !editForm.metodeId}
                          onClick={handleLockMetode}
                        >
                          {metodeLocked ? "Sudah Ditetapkan" : "Tetapkan Metode"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Belum ada pilihan metode tersedia.
                      </p>
                    )}
                  </div>
                </div>

                {progressDisabled && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Tetapkan metode pengadaan terlebih dahulu sebelum mengisi progres.
                  </div>
                )}
                {shouldLoadTahapan && isProgressTransition ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-2 rounded-lg border border-dashed p-4">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
                      </div>
                    ))}
                  </div>
                ) : shouldLoadTahapan && templateTahapan && templateTahapan.length > 0 ? (
                  <div className="space-y-4">
                    {tahapanForm.map((tahap, index) => {
                      const isDone = Boolean(tahap.tanggal);
                      return (
                        <div key={tahap.templateId} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-foreground"
                              )}
                            >
                              {index + 1}
                            </span>
                            {index < tahapanForm.length - 1 && (
                              <span className="h-full w-px bg-border" />
                            )}
                          </div>
                          <div className="flex-1 space-y-3 rounded-lg border p-4">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {tahap.namaTahap}
                                </p>
                                {tahap.deskripsi && (
                                  <p className="text-xs text-muted-foreground">
                                    {tahap.deskripsi}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={isDone ? "secondary" : "outline"}
                                className={
                                  isDone
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : undefined
                                }
                              >
                                {isDone
                                  ? `Selesai ${formatDate(tahap.tanggal)}`
                                  : "Belum dimulai"}
                              </Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor={`tanggal_${tahap.templateId}`}>
                                  Tanggal progres
                                </Label>
                                <Input
                                  id={`tanggal_${tahap.templateId}`}
                                  type="date"
                                  value={tahap.tanggal}
                                  disabled={progressDisabled}
                                  onChange={(event) =>
                                    updateTahapanValue(
                                      tahap.templateId,
                                      "tanggal",
                                      event.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`catatan_${tahap.templateId}`}>
                                  Catatan
                                </Label>
                                <Textarea
                                  id={`catatan_${tahap.templateId}`}
                                  rows={2}
                                  value={tahap.catatan}
                                  placeholder="Tambahkan catatan progres"
                                  disabled={progressDisabled}
                                  onChange={(event) =>
                                    updateTahapanValue(
                                      tahap.templateId,
                                      "catatan",
                                      event.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => handleDialogOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveProgress}
              disabled={!canSubmit || isSaving || metodeChoices.length === 0}
            >
              {isSaving ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
