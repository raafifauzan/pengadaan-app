import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Printer, PenLine, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormEvaluasi, useUpdateFormEvaluasi } from "@/hooks/useFormEvaluasi";
import PrintEvaluasi from "@/components/PrintEvaluasi";
import { Badge } from "@/components/ui/badge";
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
import { EvaluationViewToggle } from "@/components/EvaluationViewToggle";
import { ProcurementFilterBar } from "@/components/ProcurementFilterBar";
import { EVALUATION_TABLE_COLUMNS, type EvaluationColumnKey } from "@/config/table";

type FormEvaluasiRecord = Tables<"form_evaluasi"> & {
  pengajuan: Tables<"pengajuan"> | null;
  approval: Tables<"form_approval"> | null;
};

type PrintEvaluasiRow = ComponentProps<typeof PrintEvaluasi>["row"];
type FilterStatus = "all" | "pending_evaluation" | "evaluated";

const formatDateValue = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date
    .toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
};

const formatCurrency = (amount?: number | null) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getSortValue = (record: FormEvaluasiRecord, key: EvaluationColumnKey) => {
  switch (key) {
    case "created_at":
      return record.pengajuan?.timestamp ?? record.created_at ?? null;
    case "judul":
      return record.pengajuan?.judul ?? null;
    case "nilai":
      return record.pengajuan?.nilai_pengajuan ?? null;
    case "jenis_project":
      return record.pengajuan?.jenis ?? null;
    case "kode_form":
      return record.kode_form ?? null;
    case "status":
      return record.is_final ? "evaluated" : "pending_evaluation";
    default:
      return null;
  }
};

const getLampiranInfo = (record: FormEvaluasiRecord) => {
  const lampiranUrl =
    record.pengajuan?.lampiran_url ??
    (record as { lampiran_url?: string; lampiran?: string }).lampiran_url ??
    (record as { lampiran?: string }).lampiran ??
    null;
  const lampiranLabel =
    record.pengajuan?.no_surat ?? (lampiranUrl ? lampiranUrl.split("/").pop() : "-");
  return { lampiranUrl, lampiranLabel };
};

export default function FormEvaluasi() {
  const { toast } = useToast();
  const { data: formEvaluasiData, isLoading } = useFormEvaluasi();
  const updateFormEvaluasi = useUpdateFormEvaluasi();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nilaiFilter, setNilaiFilter] = useState<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
  const [sortConfig, setSortConfig] = useState<{ key: EvaluationColumnKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const evaluationList = useMemo(() => formEvaluasiData ?? [], [formEvaluasiData]);
  const itemsPerPage = 10;

  const nilaiRange = useMemo(() => {
    if (evaluationList.length === 0) {
      return { min: 0, max: 1 };
    }
    const values = evaluationList.map((record) => record.pengajuan?.nilai_pengajuan ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max: min === max ? min + 1 : max };
  }, [evaluationList]);

  useEffect(() => {
    setNilaiFilter([nilaiRange.min, nilaiRange.max]);
  }, [nilaiRange.min, nilaiRange.max]);

  const [nilaiMin, nilaiMax] = nilaiFilter;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterJenis, searchQuery, nilaiMin, nilaiMax]);

  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    evaluationList.forEach((record) => {
      if (record.pengajuan?.jenis) set.add(record.pengajuan.jenis);
    });
    return ["all", ...Array.from(set)];
  }, [evaluationList]);

  const sortedAndFilteredEvaluations = useMemo<FormEvaluasiRecord[]>(() => {
    let filtered = evaluationList.filter((record) => {
      const status = record.is_final ? "evaluated" : "pending_evaluation";
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesSearch =
        (record.kode_form?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (record.pengajuan?.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (record.pengajuan?.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesJenis =
        filterJenis === "all" ||
        (record.pengajuan?.jenis?.toLowerCase() ?? "") === filterJenis.toLowerCase();
      const nilai = record.pengajuan?.nilai_pengajuan ?? 0;
      const matchesNilai = nilai >= nilaiMin && nilai <= nilaiMax;
      return matchesStatus && matchesSearch && matchesJenis && matchesNilai;
    });

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
        if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [evaluationList, filterStatus, filterJenis, searchQuery, nilaiMin, nilaiMax, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredEvaluations.length / itemsPerPage) || 1;
  const paginatedEvaluations = sortedAndFilteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (key: EvaluationColumnKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
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
        title: "Error",
        description: "Gagal menyimpan data evaluasi",
        variant: "destructive",
      });
    }
  };

  const renderActionCell = (record: FormEvaluasiRecord) => {
    const isComplete = Boolean(record.is_final);
    const primaryLabel = isComplete ? "Print" : "Lengkapi Dokumen";
    const primaryIcon = isComplete ? <Printer className="h-3 w-3" /> : <PenLine className="h-3 w-3" />;
    const primaryClass = isComplete
      ? "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
      : "border border-[#facc15] bg-[#fef9c3] text-[#ca8a04] hover:bg-[#fde68a]";

    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            if (isComplete) {
              handlePrint(record);
            } else {
              handleDetail(record);
            }
          }}
          className={cn("h-7 px-3 text-[10px] gap-1 rounded-full", primaryClass)}
        >
          {primaryIcon}
          {primaryLabel}
        </Button>
        {isComplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              handleDetail(record);
            }}
            className="h-7 px-3 text-[10px] gap-1 rounded-full"
          >
            <PenLine className="h-3 w-3" />
            Detail
          </Button>
        )}
      </div>
    );
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
        <h1 className="text-2xl md:text-3xl font-bold">Form Evaluasi</h1>
        <p className="text-muted-foreground">
          Kelola hasil evaluasi vendor dan lanjutkan ke proses approval setelah lengkap.
        </p>
        <EvaluationViewToggle />
      </div>

      <ProcurementFilterBar
        searchPlaceholder="Cari berdasarkan No Evaluasi atau Judul..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={[
          { value: "all", label: "Semua Status" },
          { value: "pending_evaluation", label: "Menunggu Evaluasi" },
          { value: "evaluated", label: "Sudah Dievaluasi" },
        ]}
        statusValue={filterStatus}
        onStatusChange={(value) => setFilterStatus(value as FilterStatus)}
        jenisOptions={jenisOptions.map((value) => ({
          value,
          label: value === "all" ? "Semua Jenis" : value,
        }))}
        jenisValue={filterJenis}
        onJenisChange={setFilterJenis}
        nilaiRange={[nilaiRange.min, nilaiRange.max]}
        nilaiValue={nilaiFilter}
        onNilaiChange={setNilaiFilter}
      />

      <div className="bg-card rounded-lg border overflow-x-auto">
        <div className="min-w-[900px]">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {EVALUATION_TABLE_COLUMNS.map((column) => {
                  const alignClass = column.align ?? "";
                  const justifyClass = column.justify ?? "justify-start";
                  const isSortable = Boolean(column.sortable);
                  const widthStyle = {
                    width: column.basis,
                    minWidth: column.minWidth ?? column.basis,
                  };
                  return (
                    <TableHead
                      key={column.key}
                      className={cn(column.headPadding, alignClass, "text-sm font-semibold text-muted-foreground")}
                      style={widthStyle}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => handleSortChange(column.key)}
                          className={cn("flex w-full items-center gap-1", justifyClass)}
                        >
                          {column.label}
                          <ChevronsUpDown
                            className={cn(
                              "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                              sortConfig?.key === column.key ? "opacity-100" : "opacity-60"
                            )}
                          />
                        </button>
                      ) : (
                        <span className={cn("flex w-full", justifyClass)}>{column.label}</span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvaluations.map((evaluation) => {
                const { lampiranUrl, lampiranLabel } = getLampiranInfo(evaluation);
                return (
                  <TableRow
                    key={evaluation.id}
                    onClick={() => handleDetail(evaluation)}
                    className="cursor-pointer border-b hover:bg-muted/50"
                  >
                    {EVALUATION_TABLE_COLUMNS.map((column) => {
                      const alignClass = column.align ?? "";
                      let content: ReactNode;
                      const widthStyle = {
                        width: column.basis,
                        minWidth: column.minWidth ?? column.basis,
                      };
                      switch (column.key) {
                        case "created_at":
                          content = formatDateValue(evaluation.pengajuan?.timestamp ?? evaluation.created_at);
                          break;
                        case "judul":
                          content = (
                            <div>
                              <div>{evaluation.pengajuan?.judul || "Tanpa Judul"}</div>
                              <div className="mt-2 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                                {lampiranUrl ? (
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
                                      {lampiranLabel}
                                    </a>
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5"
                                  >
                                    {lampiranLabel}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                          break;
                        case "nilai":
                          content = formatCurrency(evaluation.pengajuan?.nilai_pengajuan ?? null);
                          break;
                        case "jenis_project":
                          content = evaluation.pengajuan?.jenis ?? "-";
                          break;
                        case "kode_form":
                          content = (
                            <span className="font-mono text-sm text-muted-foreground">
                              {evaluation.kode_form ?? "-"}
                            </span>
                          );
                          break;
                        case "status":
                          content = renderActionCell(evaluation);
                          break;
                        default:
                          content = "-";
                      }

                      return (
                        <TableCell
                          key={`${evaluation.id}-${column.key}`}
                          className={cn(column.cellPadding, alignClass)}
                          style={widthStyle}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
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
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                  className="cursor-pointer"
                >
                  {index + 1}
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
                    {formatCurrency(detailDialog.data.pengajuan?.nilai_pengajuan ?? null)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="text-sm text-foreground">
                    {formatDateValue(detailDialog.data.created_at)}
                  </p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Lampiran</p>
                  <div>
                    {(() => {
                      const lampiranUrl =
                        detailDialog.data.pengajuan?.lampiran_url ??
                        (detailDialog.data as { lampiran_url?: string; lampiran?: string }).lampiran_url ??
                        (detailDialog.data as { lampiran?: string }).lampiran ??
                        null;
                      const lampiranLabel =
                        detailDialog.data.pengajuan?.no_surat ??
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

              {detailDialog.readonly ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Ringkasan Evaluasi</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Nama Anggaran</p>
                      <p className="text-sm text-foreground">{detailDialog.data.nama_anggaran || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Reg. Anggaran</p>
                      <p className="text-sm text-foreground">{detailDialog.data.reg_anggaran || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Nilai Evaluasi</p>
                      <p className="text-sm text-foreground">
                        {detailDialog.data.anggaran_hps
                          ? formatCurrency(detailDialog.data.anggaran_hps)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Form Evaluator</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Nama Anggaran</p>
                      <Input
                        value={evaluatorForm.namaAnggaran}
                        onChange={(e) => setEvaluatorForm({ ...evaluatorForm, namaAnggaran: e.target.value })}
                        placeholder="Contoh: Belanja Modal TI"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Reg. Anggaran</p>
                      <Input
                        type="number"
                        value={evaluatorForm.regAnggaran}
                        onChange={(e) => setEvaluatorForm({ ...evaluatorForm, regAnggaran: e.target.value })}
                        placeholder="Nomor registrasi"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Nilai Evaluasi</p>
                      <Input
                        type="number"
                        value={evaluatorForm.nilaiEvaluasi}
                        onChange={(e) => setEvaluatorForm({ ...evaluatorForm, nilaiEvaluasi: e.target.value })}
                        placeholder="Nilai hasil evaluasi"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog({ open: false, data: null, readonly: false })}>
              {detailDialog.readonly ? "Tutup" : "Cancel"}
            </Button>
            {!detailDialog.readonly && <Button onClick={handleSubmitEvaluator}>Submit</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
