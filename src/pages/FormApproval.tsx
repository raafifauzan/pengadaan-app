import { useState, useMemo, useEffect, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, ChevronsUpDown, PenLine, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormEvaluasi, useUpdateFormEvaluasi, useUpsertFormApproval } from "@/hooks/useFormEvaluasi";
import PrintEvaluasi from "@/components/PrintEvaluasi";
import { Badge } from "@/components/ui/badge";
import { EvaluationViewToggle } from "@/components/EvaluationViewToggle";
import { ProcurementFilterBar } from "@/components/ProcurementFilterBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ApprovalDatePicker } from "@/components/approval/ApprovalDatePicker";

type FormEvaluasiRecord = Tables<"form_evaluasi"> & {
  pengajuan: Tables<"pengajuan"> | null;
  approval: Tables<"form_approval"> | null;
};

type ProgresRecord = FormEvaluasiRecord;
type PrintEvaluasiRow = ComponentProps<typeof PrintEvaluasi>["row"];
type ProgresSortKey = "kode_form" | "judul" | "unit";

const approvalFlow = [
  { key: "sekper", label: "Sekretaris Perusahaan", column: "sekper_date" as const },
  { key: "sevpOperation", label: "SEVP Operation", column: "sevp_operation_date" as const },
  { key: "finance", label: "Keuangan", column: "keuangan_date" as const },
  { key: "sevpSupport", label: "SEVP Business Support", column: "sevp_support_date" as const },
  { key: "director", label: "Direktur", column: "direktur_date" as const },
];
type ApprovalColumn = (typeof approvalFlow)[number]["column"];

const getProgresSortValue = (record: ProgresRecord, key: ProgresSortKey): string | number | null => {
  switch (key) {
    case "kode_form":
      return record.kode_form;
    case "judul":
      return record.pengajuan?.judul ?? null;
    case "unit":
      return record.pengajuan?.unit ?? null;
    default:
      return null;
  }
};

const compareValues = (
  aValue: string | number | null,
  bValue: string | number | null,
  direction: "asc" | "desc"
) => {
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (typeof aValue === "number" && typeof bValue === "number") {
    return direction === "asc" ? aValue - bValue : bValue - aValue;
  }

  const aStr = String(aValue).toLowerCase();
  const bStr = String(bValue).toLowerCase();

  if (aStr < bStr) return direction === "asc" ? -1 : 1;
  if (aStr > bStr) return direction === "asc" ? 1 : -1;
  return 0;
};

const isApprovalFlowComplete = (record: ProgresRecord) => {
  return approvalFlow.every((flow) => Boolean(record.approval?.[flow.column]));
};

const getProgressStatus = (record: ProgresRecord): "proses" | "selesai" => {
  return isApprovalFlowComplete(record) ? "selesai" : "proses";
};

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    amount
  );
};

export default function FormApproval() {
  const { toast } = useToast();
  const { data: formEvaluasiData, isLoading } = useFormEvaluasi();
  const updateFormEvaluasi = useUpdateFormEvaluasi();
  const upsertApproval = useUpsertFormApproval();

  const [filterStatus, setFilterStatus] = useState<"all" | "proses" | "selesai">("all");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nilaiFilter, setNilaiFilter] = useState<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
  const [sortConfig, setSortConfig] = useState<{ key: ProgresSortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalDates, setApprovalDates] = useState<Record<string, Partial<Record<ApprovalColumn, string>>>>({});
  const [editingApproval, setEditingApproval] = useState<Record<string, Partial<Record<ApprovalColumn, boolean>>>>({});
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    data: FormEvaluasiRecord | null;
    readonly: boolean;
  }>({ open: false, data: null, readonly: false });
  const [evaluatorForm, setEvaluatorForm] = useState({
    sumberAnggaran: "",
    namaAnggaran: "",
    regAnggaran: "",
    nilaiEvaluasi: "",
  });
  const [printData, setPrintData] = useState<PrintEvaluasiRow | null>(null);

  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(todayIsoDate);
  const itemsPerPage = 10;
  const nilaiRange = useMemo(() => {
    if (!formEvaluasiData || formEvaluasiData.length === 0) {
      return { min: 0, max: 1 };
    }
    const values = formEvaluasiData.map((record) => record.pengajuan?.nilai_pengajuan ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max: min === max ? min + 1 : max };
  }, [formEvaluasiData]);

  useEffect(() => {
    setNilaiFilter([nilaiRange.min, nilaiRange.max]);
  }, [nilaiRange.min, nilaiRange.max]);

  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    formEvaluasiData?.forEach((record) => {
      if (record.pengajuan?.jenis) set.add(record.pengajuan.jenis);
    });
    return ["all", ...Array.from(set)];
  }, [formEvaluasiData]);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    formEvaluasiData?.forEach((record) => {
      if (record.pengajuan?.unit) set.add(record.pengajuan.unit);
    });
    return ["all", ...Array.from(set)];
  }, [formEvaluasiData]);

  const sortedAndFilteredProgres = useMemo<ProgresRecord[]>(() => {
    if (!formEvaluasiData) return [];

    let filtered = formEvaluasiData.filter((record) => record.is_final);

    const isNilaiFilterActive = nilaiFilter[1] !== Number.MAX_SAFE_INTEGER;

    filtered = filtered.filter((record) => {
      const progressStatus = getProgressStatus(record);
      const matchesStatus = filterStatus === "all" || progressStatus === filterStatus;
      const matchesJenis =
        filterJenis === "all" ||
        (record.pengajuan?.jenis?.toLowerCase() ?? "") === filterJenis.toLowerCase();
      const matchesUnit =
        filterUnit === "all" ||
        (record.pengajuan?.unit?.toLowerCase() ?? "") === filterUnit.toLowerCase();
      const matchesSearch =
        (record.kode_form?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (record.pengajuan?.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const nilai = record.pengajuan?.nilai_pengajuan ?? 0;
      const matchesNilai =
        !isNilaiFilterActive || (nilai >= nilaiFilter[0] && nilai <= nilaiFilter[1]);
      return matchesStatus && matchesJenis && matchesUnit && matchesSearch && matchesNilai;
    });

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) =>
        compareValues(
          getProgresSortValue(a, sortConfig.key),
          getProgresSortValue(b, sortConfig.key),
          sortConfig.direction
        )
      );
    }

    return filtered as ProgresRecord[];
  }, [formEvaluasiData, filterStatus, filterJenis, filterUnit, searchQuery, nilaiFilter, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredProgres.length / itemsPerPage);
  const paginatedProgres = sortedAndFilteredProgres.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clampToToday = (value: string) => {
    if (!value) return "";
    return value > todayIsoDate ? todayIsoDate : value;
  };

  const handleApprovalDateChange = (formId: string, column: ApprovalColumn, value: string) => {
    const clamped = clampToToday(value);
    setApprovalDates((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [column]: clamped,
      },
    }));
  };

  const formatDateInput = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const getApprovalValue = (record: ProgresRecord, column: ApprovalColumn) => {
    return record.approval?.[column] ?? null;
  };

  const isStepCompleted = (record: ProgresRecord, flowIndex: number) => {
    const flowItem = approvalFlow[flowIndex];
    if (!flowItem) return false;
    const savedValue = getApprovalValue(record, flowItem.column);
    return Boolean(savedValue);
  };

  const isStepUnlocked = (record: ProgresRecord, flowIndex: number) => {
    if (flowIndex === 0) return true;
    const previousColumn = approvalFlow[flowIndex - 1]?.column;
    if (!previousColumn) return true;
    return Boolean(getApprovalValue(record, previousColumn));
  };

  const startEditingApproval = (formId: string, column: ApprovalColumn, initialValue: string) => {
    setEditingApproval((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [column]: true,
      },
    }));
    setApprovalDates((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [column]: initialValue,
      },
    }));
  };

  const closeApprovalEditor = (formId: string, column: ApprovalColumn) => {
    setEditingApproval((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [column]: false,
      },
    }));

    setApprovalDates((prev) => {
      const currentRecord = { ...(prev[formId] ?? {}) };
      delete currentRecord[column];
      if (Object.keys(currentRecord).length === 0) {
        const { [formId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [formId]: currentRecord };
    });
  };

  const saveApprovalDate = async (formId: string, column: ApprovalColumn, value: string | null) => {
    if (!value) return;
    const isoValue = new Date(`${value}T00:00:00Z`).toISOString();
    const label = approvalFlow.find((flow) => flow.column === column)?.label ?? "Approval";

    try {
      await upsertApproval.mutateAsync({
        formEvaluasiId: formId,
        updates: { [column]: isoValue },
      });
      toast({
        title: "Approval diperbarui",
        description: `${label} berhasil diperbarui.`,
      });
    } catch (error) {
      toast({
        title: "Gagal menyimpan approval",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan tanggal approval.",
        variant: "destructive",
      });
      return;
    } finally {
      closeApprovalEditor(formId, column);
    }
  };

  const renderApprovalCell = (record: ProgresRecord, flowItem: (typeof approvalFlow)[number], index: number) => {
    const column = flowItem.column;
    const savedValueRaw = getApprovalValue(record, column);
    const savedValue = formatDateInput(savedValueRaw);
    const draftValue = approvalDates[record.id]?.[column];
    const currentValue = draftValue ?? savedValue;
    const unlocked = isStepUnlocked(record, index);
    const isCompleted = Boolean(savedValueRaw);
    const isEditing = Boolean(editingApproval[record.id]?.[column]);
    const circleBase = "h-6 w-6 rounded-full flex items-center justify-center text-[10px]";
    const canEdit = unlocked || isCompleted;

    return (
      <div className="flex items-center justify-center min-h-[48px]">
        <Popover
          open={isEditing}
          onOpenChange={(open) => {
            if (open) {
              if (!canEdit) return;
              startEditingApproval(record.id, column, savedValue);
            } else {
              closeApprovalEditor(record.id, column);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={!canEdit}
              className={cn(
                circleBase,
                canEdit
                  ? "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 disabled:opacity-50"
                  : "border border-muted-foreground/30 bg-transparent text-muted-foreground",
                isCompleted && "border-emerald-400 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              )}
            >
              {isCompleted ? <Check className="h-3 w-3" /> : <PenLine className="h-3 w-3" />}
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="p-0 border-none shadow-none bg-transparent">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden="true" />
            <div className="relative z-10">
              <ApprovalDatePicker
                value={currentValue ?? ""}
                maxDate={todayDate}
                onChange={(val) => handleApprovalDateChange(record.id, column, val)}
                onSave={() => saveApprovalDate(record.id, column, currentValue ?? null)}
                onCancel={() => closeApprovalEditor(record.id, column)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const handlePrint = (formEv: FormEvaluasiRecord) => {
    const printRow: PrintEvaluasiRow = {
      kodeForm: formEv.kode_form,
      tanggalForm: formEv.created_at ?? formEv.pengajuan?.timestamp ?? "",
      judul: formEv.pengajuan?.judul ?? "",
      noSurat: formEv.pengajuan?.no_surat ?? "",
      unit: formEv.pengajuan?.unit ?? "",
      jenis: formEv.pengajuan?.jenis ?? "",
      nilaiPengajuan: formEv.pengajuan?.nilai_pengajuan ?? null,
      anggaranHps: formEv.anggaran_hps ?? undefined,
      namaAnggaran: formEv.nama_anggaran ?? undefined,
      regAnggaran: formEv.reg_anggaran ?? undefined,
      isFinal: formEv.is_final ?? undefined,
    };
    setPrintData(printRow);
  };

  const handleDetail = (formEv: FormEvaluasiRecord, options?: { readonly?: boolean }) => {
    const readonly = options?.readonly ?? false;
    setDetailDialog({ open: true, data: formEv, readonly });
    if (!readonly) {
      setEvaluatorForm({
        sumberAnggaran: formEv.pengajuan?.jenis || "",
        namaAnggaran: formEv.nama_anggaran || "",
        regAnggaran: formEv.reg_anggaran || "",
        nilaiEvaluasi: formEv.anggaran_hps?.toString() || "",
      });
    }
  };

  const handleSubmitEvaluator = async () => {
    if (!detailDialog.data) return;

    const isEvaluatorComplete =
      Boolean(evaluatorForm.namaAnggaran?.trim()) &&
      Boolean(evaluatorForm.regAnggaran?.trim()) &&
      Boolean(evaluatorForm.nilaiEvaluasi?.trim());

    try {
      await updateFormEvaluasi.mutateAsync({
        id: detailDialog.data.id,
        updates: {
          nama_anggaran: evaluatorForm.namaAnggaran,
          reg_anggaran: evaluatorForm.regAnggaran,
          anggaran_hps: parseFloat(evaluatorForm.nilaiEvaluasi) || 0,
          is_final: isEvaluatorComplete,
        },
      });

      toast({
        title: "Data Evaluasi Tersimpan",
        description: "Data evaluasi berhasil disimpan",
      });
      setDetailDialog({ open: false, data: null, readonly: false });
      setEvaluatorForm({
        sumberAnggaran: "",
        namaAnggaran: "",
        regAnggaran: "",
        nilaiEvaluasi: "",
      });
    } catch (error) {
      toast({
        title: "Gagal menyimpan data",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data evaluasi.",
        variant: "destructive",
      });
    }
  };

  const handleSendToPengadaan = (kodeForm?: string | null) => {
    if (!kodeForm) {
      toast({
        title: "Kode Form tidak ditemukan",
        description: "Pastikan form evaluasi memiliki kode form sebelum mengirim ke pengadaan.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Dikirim ke Pengadaan",
      description: `Form ${kodeForm} telah dikirim ke tim pengadaan.`,
    });
  };

  const handleSortChange = (key: ProgresSortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
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
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Progres Dokumen</h1>
        <p className="text-muted-foreground">
          Monitor proses approval dokumen evaluasi yang sudah lengkap dan siap dicetak.
        </p>
        <EvaluationViewToggle />
      </div>

      <ProcurementFilterBar
        searchPlaceholder="Cari berdasarkan No Evaluasi atau Judul..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={[
          { value: "all", label: "Semua Status" },
          { value: "proses", label: "Proses" },
          { value: "selesai", label: "Selesai" },
        ]}
        statusValue={filterStatus}
        onStatusChange={(value) => setFilterStatus(value as typeof filterStatus)}
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

      <div className="bg-card rounded-lg border overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] px-6">
                  <button onClick={() => handleSortChange("kode_form")} className="text-left flex items-center gap-1 hover:text-foreground">
                    No Form Evaluasi
                    <ChevronsUpDown
                      className={cn(
                        "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                        sortConfig?.key === "kode_form" ? "opacity-100" : "opacity-60"
                      )}
                    />
                  </button>
                </TableHead>
                <TableHead className="w-[320px] px-4">
                  <button onClick={() => handleSortChange("judul")} className="flex items-center gap-1 hover:text-foreground">
                    Judul
                    <ChevronsUpDown
                      className={cn(
                        "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                        sortConfig?.key === "judul" ? "opacity-100" : "opacity-60"
                      )}
                    />
                  </button>
                </TableHead>
                {approvalFlow.map((flow) => (
                  <TableHead key={flow.key} className="w-[120px] px-4 text-center">
                    {flow.label}
                  </TableHead>
                ))}
                <TableHead className="w-[120px] px-4 text-center">Lampiran Form Evaluasi</TableHead>
                <TableHead className="w-[200px] px-4 text-center">Status &amp; Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProgres.map((progres) => {
                const progresLampiran =
                  progres.pengajuan?.lampiran_url ??
                  (progres as { lampiran_url?: string; lampiran?: string }).lampiran_url ??
                  (progres as { lampiran_url?: string; lampiran?: string }).lampiran ??
                  null;
                const progresLampiranLabel =
                  progres.pengajuan?.no_surat || (progresLampiran ? progresLampiran.split("/").pop() : "-");
                const progressStatus = getProgressStatus(progres);
                const isFinished = progressStatus === "selesai";

                return (
                  <TableRow
                    key={progres.id}
                    onClick={() => handleDetail(progres, { readonly: true })}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="px-6 py-2 font-mono text-sm text-muted-foreground">
                      {progres.kode_form || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-2 w-[320px] max-w-[280px] text-sm whitespace-normal break-words">
                      <div>
                        <div>{progres.pengajuan?.judul || "-"}</div>
                        <div className="mt-2 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                          {progresLampiran ? (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                            >
                              <a
                                href={progresLampiran}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 no-underline text-primary"
                              >
                                {progresLampiranLabel}
                              </a>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5"
                            >
                              {progresLampiranLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {approvalFlow.map((flowItem, index) => (
                      <TableCell
                        key={flowItem.key}
                        className="px-4 py-2 text-center align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderApprovalCell(progres, flowItem, index)}
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast({ title: "Upload", description: "Upload lampiran" })}
                        className="h-6 px-2.5 rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 text-[10px] font-semibold gap-1"
                      >
                        <Upload className="h-2.5 w-2.5" />
                        <span className="leading-none">Upload</span>
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      {isFinished ? (
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendToPengadaan(progres.kode_form)}
                            className="h-6 px-2.5 rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 text-[10px] gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="leading-none">Kirim</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDetail(progres, { readonly: true })}
                            className="h-6 px-2.5 rounded-full text-[10px]"
                          >
                            Detail
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDetail(progres, { readonly: true })}
                          className="h-6 px-3 rounded-full border border-[#facc15] bg-[#fef9c3] text-[#ca8a04] hover:bg-[#fde68a] hover:border-[#facc15] hover:text-[#ca8a04] text-[10px] font-semibold"
                        >
                          Perbarui Progres
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
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
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {printData && <PrintEvaluasi row={printData} onClose={() => setPrintData(null)} />}

      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, data: null, readonly: false })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto text-sm">
          <DialogHeader>
            <DialogTitle>Detail Evaluasi</DialogTitle>
          </DialogHeader>
          {detailDialog.data && (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">No Evaluasi</p>
                  <p className="text-sm text-foreground">{detailDialog.data.kode_form || "-"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">No Surat</p>
                  <p className="text-sm text-foreground">{detailDialog.data.pengajuan?.no_surat || "-"}</p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Judul Pengajuan</p>
                  <p className="text-sm text-foreground">{detailDialog.data.pengajuan?.judul || "-"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Bagian/Unit</p>
                  <p className="text-sm text-foreground">{detailDialog.data.pengajuan?.unit || "-"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Jenis Pengajuan</p>
                  <p className="text-sm text-foreground">{detailDialog.data.pengajuan?.jenis || "-"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Nilai Pengajuan</p>
                  <p className="text-sm text-foreground">
                    {formatCurrency(detailDialog.data.pengajuan?.nilai_pengajuan ?? 0)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Status Pengajuan</p>
                  <p className="text-sm text-foreground capitalize">{detailDialog.data.pengajuan?.status || "-"}</p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Lampiran</p>
                  <div>
                    {(() => {
                      const lampiranUrl =
                        detailDialog.data.pengajuan?.lampiran_url ??
                        (detailDialog.data as any).lampiran_url ??
                        (detailDialog.data as { lampiran?: string }).lampiran ??
                        null;
                      const lampiranLabel =
                        detailDialog.data.pengajuan?.no_surat ||
                        (lampiranUrl ? lampiranUrl.split("/").pop() : null);

                      if (!lampiranUrl) {
                        return (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5"
                          >
                            Tidak ada lampiran
                          </Badge>
                        );
                      }

                      return (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                        >
                          <a
                            href={lampiranUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 no-underline text-primary"
                          >
                            <FileText className="h-3 w-3" />
                            {lampiranLabel ?? "Lampiran"}
                          </a>
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Detail Evaluasi</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Nama Anggaran</p>
                    <Input
                      value={
                        detailDialog.readonly ? detailDialog.data.nama_anggaran ?? "" : evaluatorForm.namaAnggaran
                      }
                      onChange={(e) => setEvaluatorForm((prev) => ({ ...prev, namaAnggaran: e.target.value }))}
                      disabled={detailDialog.readonly}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Reg. Anggaran</p>
                    <Input
                      value={
                        detailDialog.readonly ? detailDialog.data.reg_anggaran ?? "" : evaluatorForm.regAnggaran
                      }
                      onChange={(e) => setEvaluatorForm((prev) => ({ ...prev, regAnggaran: e.target.value }))}
                      disabled={detailDialog.readonly}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Nilai Evaluasi</p>
                    <Input
                      value={
                        detailDialog.readonly
                          ? detailDialog.data.anggaran_hps?.toString() ?? ""
                          : evaluatorForm.nilaiEvaluasi
                      }
                      onChange={(e) => setEvaluatorForm((prev) => ({ ...prev, nilaiEvaluasi: e.target.value }))}
                      disabled={detailDialog.readonly}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => detailDialog.data && handlePrint(detailDialog.data)}>
                <FileText className="h-4 w-4" />
                Print
              </Button>
            </div>
            {!detailDialog.readonly && (
              <Button onClick={handleSubmitEvaluator}>
                Simpan Perubahan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
