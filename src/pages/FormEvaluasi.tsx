import { useMemo, useState, useEffect, type ComponentProps } from "react";
import { FileText, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormEvaluasi, useUpdateFormEvaluasi } from "@/hooks/useFormEvaluasi";
import PrintEvaluasi from "@/components/PrintEvaluasi";
import { EvaluationViewToggle } from "@/components/EvaluationViewToggle";
import { ProcurementFilterBar } from "@/components/ProcurementFilterBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type FormEvaluasiRecord = Tables<"form_evaluasi"> & {
  pengajuan: Tables<"pengajuan"> | null;
  approval: Tables<"form_approval"> | null;
};

type PrintEvaluasiRow = ComponentProps<typeof PrintEvaluasi>["row"];
type EvaluationSortKey = "created_at" | "judul" | "nilai_pengajuan";

const getEvaluationSortValue = (record: FormEvaluasiRecord, key: EvaluationSortKey): string | number | null => {
  switch (key) {
    case "created_at":
      return record.created_at;
    case "judul":
      return record.pengajuan?.judul ?? null;
    case "nilai_pengajuan":
      return record.pengajuan?.nilai_pengajuan ?? null;
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

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    amount
  );
};

export default function FormEvaluasi() {
  const { toast } = useToast();
  const { data: formEvaluasiData, isLoading } = useFormEvaluasi();
  const updateFormEvaluasi = useUpdateFormEvaluasi();

  const [filterStatus, setFilterStatus] = useState<"all" | "pending_evaluation" | "evaluated">("all");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [nilaiFilter, setNilaiFilter] = useState<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: EvaluationSortKey; direction: "asc" | "desc" } | null>(null);
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

  const itemsPerPage = 10;

  const nilaiRange = useMemo(() => {
    if (!formEvaluasiData || formEvaluasiData.length === 0) {
      return { min: 0, max: 1 };
    }
    const values = formEvaluasiData.map((ev) => ev.pengajuan?.nilai_pengajuan ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max: min === max ? min + 1 : max };
  }, [formEvaluasiData]);

  useEffect(() => {
    setNilaiFilter([nilaiRange.min, nilaiRange.max]);
  }, [nilaiRange.min, nilaiRange.max]);

  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    formEvaluasiData?.forEach((ev) => {
      if (ev.pengajuan?.jenis) set.add(ev.pengajuan.jenis);
    });
    return ["all", ...Array.from(set)];
  }, [formEvaluasiData]);

  const sortedAndFilteredEvaluations = useMemo<FormEvaluasiRecord[]>(() => {
    if (!formEvaluasiData) return [];

    const isNilaiFilterActive = nilaiFilter[1] !== Number.MAX_SAFE_INTEGER;

    let filtered = formEvaluasiData.filter((ev) => {
      const status = ev.is_final ? "evaluated" : "pending_evaluation";
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesJenis =
        filterJenis === "all" ||
        (ev.pengajuan?.jenis?.toLowerCase() ?? "") === filterJenis.toLowerCase();
      const matchesSearch =
        (ev.kode_form?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (ev.pengajuan?.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (ev.pengajuan?.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const nilai = ev.pengajuan?.nilai_pengajuan ?? 0;
      const matchesNilai =
        !isNilaiFilterActive || (nilai >= nilaiFilter[0] && nilai <= nilaiFilter[1]);
      return matchesStatus && matchesJenis && matchesSearch && matchesNilai;
    });

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) =>
        compareValues(
          getEvaluationSortValue(a, sortConfig.key),
          getEvaluationSortValue(b, sortConfig.key),
          sortConfig.direction
        )
      );
    }

    return filtered;
  }, [formEvaluasiData, filterJenis, filterStatus, nilaiFilter, searchQuery, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredEvaluations.length / itemsPerPage) || 1;
  const paginatedEvaluations = sortedAndFilteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: EvaluationSortKey) => {
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
        title: "Gagal menyimpan data",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data evaluasi.",
        variant: "destructive",
      });
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
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Form Evaluasi</h1>
        <p className="text-muted-foreground">Generate dan kelola form evaluasi vendor.</p>
        <EvaluationViewToggle />
      </div>

      <ProcurementFilterBar
        searchPlaceholder="Cari berdasarkan Kode Form, No Surat, atau Judul..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={[
          { value: "all", label: "Semua Status" },
          { value: "pending_evaluation", label: "Menunggu Evaluasi" },
          { value: "evaluated", label: "Sudah Dievaluasi" },
        ]}
        statusValue={filterStatus}
        onStatusChange={(value) => setFilterStatus(value as typeof filterStatus)}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px] px-6">
                  <button onClick={() => handleSort("created_at")} className="flex items-center gap-1 hover:text-foreground">
                    Tanggal Pengajuan
                    <ChevronsUpDown
                      className={cn(
                        "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                        sortConfig?.key === "created_at" ? "opacity-100" : "opacity-60"
                      )}
                    />
                  </button>
                </TableHead>
                <TableHead className="w-[320px] px-4">
                  <button onClick={() => handleSort("judul")} className="flex items-center gap-1 hover:text-foreground">
                    Paket Pengajuan
                    <ChevronsUpDown
                      className={cn(
                        "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                        sortConfig?.key === "judul" ? "opacity-100" : "opacity-60"
                      )}
                    />
                  </button>
                </TableHead>
                <TableHead className="w-[160px] px-4">
                  <button
                    onClick={() => handleSort("nilai_pengajuan")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Nilai Project
                    <ChevronsUpDown
                      className={cn(
                        "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                        sortConfig?.key === "nilai_pengajuan" ? "opacity-100" : "opacity-60"
                      )}
                    />
                  </button>
                </TableHead>
                <TableHead className="w-[140px] px-4">Jenis Project</TableHead>
                <TableHead className="w-[140px] px-4">Kode Form</TableHead>
                <TableHead className="w-[200px] px-4 text-center">Status &amp; Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvaluations.map((evaluation) => {
                const lampiranUrl =
                  evaluation.pengajuan?.lampiran_url ??
                  (evaluation as { lampiran_url?: string; lampiran?: string }).lampiran_url ??
                  (evaluation as { lampiran_url?: string; lampiran?: string }).lampiran ??
                  null;
                const lampiranLabel =
                  evaluation.pengajuan?.no_surat || (lampiranUrl ? lampiranUrl.split("/").pop() : "-");
                const isComplete = Boolean(evaluation.is_final);

                return (
                  <TableRow
                    key={evaluation.id}
                    onClick={() => handleDetail(evaluation)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="text-sm px-6 py-2">
                      {evaluation.pengajuan?.timestamp
                        ? new Date(evaluation.pengajuan.timestamp).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).replace(".", "")
                        : "-"}
                    </TableCell>
                    <TableCell className="w-[320px] max-w-[280px] text-sm whitespace-normal break-words px-4 py-2">
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
                    </TableCell>
                    <TableCell className="text-sm px-4 py-2">{formatCurrency(evaluation.pengajuan?.nilai_pengajuan)}</TableCell>
                    <TableCell className="text-sm px-4 py-2">{evaluation.pengajuan?.jenis || "-"}</TableCell>
                    <TableCell className="px-4 py-2 font-mono text-sm text-muted-foreground">
                      {evaluation.kode_form || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      {isComplete ? (
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePrint(evaluation)}
                            className="h-6 px-2.5 rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 text-[10px] gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="leading-none">Print</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDetail(evaluation)}
                            className="h-6 px-2.5 rounded-full text-[10px]"
                          >
                            Edit
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDetail(evaluation)}
                          className="h-6 px-3 rounded-full border border-[#facc15] bg-[#fef9c3] text-[#ca8a04] hover:bg-[#fde68a] hover:border-[#facc15] hover:text-[#ca8a04] text-[10px] font-semibold"
                        >
                          Lengkapi Dokumen
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {printData && <PrintEvaluasi row={printData} onClose={() => setPrintData(null)} />}

      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => {
          if (open) {
            setDetailDialog((prev) => ({ ...prev, open: true }));
            return;
          }
          setDetailDialog({ open: false, data: null, readonly: false });
          setEvaluatorForm({
            sumberAnggaran: "",
            namaAnggaran: "",
            regAnggaran: "",
            nilaiEvaluasi: "",
          });
        }}
      >
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
                  <p className="text-sm text-foreground">{formatCurrency(detailDialog.data.pengajuan?.nilai_pengajuan)}</p>
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
                        detailDialog.data.lampiran_url ??
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
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => detailDialog.data && handlePrint(detailDialog.data)}
              >
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
