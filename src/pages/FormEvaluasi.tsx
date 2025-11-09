import { useState, useMemo, useEffect, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileText, Upload, ChevronsUpDown, PenLine, Check } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type FormEvaluasiRecord = Tables<"form_evaluasi"> & {
  pengajuan: Tables<"pengajuan"> | null;
};

type PrintEvaluasiRow = ComponentProps<typeof PrintEvaluasi>["row"];

type EvaluationSortKey = "created_at" | "judul" | "nilai_pengajuan";
type ProgresSortKey = "kode_form" | "judul" | "unit";

type EvaluationStatus = "pending_evaluation" | "evaluated" | "approved" | "rejected";
type ApprovalStatus = "pending" | "approved" | "rejected";

interface EvaluationRequest {
  id: string;
  noEvaluasi: string;
  noSurat: string;
  title: string;
  department: string;
  requestor: string;
  jenisPengajuan: string;
  amount: number;
  status: EvaluationStatus;
  approvedDate: string;
  sumberAnggaran?: string;
  namaAnggaran?: string;
  regAnggaran?: number;
  nilaiEvaluasi?: number;
}

interface ProgresDocument {
  id: string;
  noEvaluasi: string;
  title: string;
  department: string;
  approval1: ApprovalStatus;
  approval2: ApprovalStatus;
  approval3: ApprovalStatus;
  approval4: ApprovalStatus;
  approval5: ApprovalStatus;
  lampiran?: string;
  status: "proses" | "selesai" | "revisi";
}

type ProgresRecord = FormEvaluasiRecord & {
  approval1?: ApprovalStatus;
  approval2?: ApprovalStatus;
  approval3?: ApprovalStatus;
  approval4?: ApprovalStatus;
  approval5?: ApprovalStatus;
};

const mockEvaluations: EvaluationRequest[] = [
  {
    id: "REQ-003",
    noEvaluasi: "0001/FORM-EV/PENG/X/2025",
    noSurat: "116/MEMO/TRS/IX/2025",
    title: "Peralatan Meeting",
    department: "Marketing",
    requestor: "bob.wilson@company.com",
    jenisPengajuan: "Barang",
    amount: 8000000,
    status: "pending_evaluation",
    approvedDate: "2024-01-15",
  },
  {
    id: "REQ-005",
    noEvaluasi: "0002/FORM-EV/PENG/X/2025",
    noSurat: "117/MEMO/IT/IX/2025",
    title: "Pengadaan Komputer",
    department: "IT",
    requestor: "alice.brown@company.com",
    jenisPengajuan: "Barang",
    amount: 35000000,
    status: "evaluated",
    approvedDate: "2024-01-14",
    sumberAnggaran: "APBN",
    namaAnggaran: "Belanja Modal TI",
    regAnggaran: 100250,
    nilaiEvaluasi: 34500000,
  },
];

const mockProgres: ProgresDocument[] = [
  {
    id: "REQ-005",
    noEvaluasi: "0002/FORM-EV/PENG/X/2025",
    title: "Pengadaan Komputer",
    department: "IT",
    approval1: "approved",
    approval2: "approved",
    approval3: "pending",
    approval4: "pending",
    approval5: "pending",
    status: "proses",
  },
  {
    id: "REQ-003",
    noEvaluasi: "0001/FORM-EV/PENG/X/2025",
    title: "Peralatan Meeting",
    department: "Marketing",
    approval1: "approved",
    approval2: "approved",
    approval3: "approved",
    approval4: "approved",
    approval5: "approved",
    lampiran: "evaluasi_001_final.pdf",
    status: "selesai",
  },
];

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

const getProgresSortValue = (record: FormEvaluasiRecord, key: ProgresSortKey): string | number | null => {
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

const compareValues = (aValue: string | number | null, bValue: string | number | null, direction: "asc" | "desc") => {
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

type TabKey = "kelengkapan" | "progres";

export default function FormEvaluasi({ defaultTab = "kelengkapan" }: { defaultTab?: TabKey } = {}) {
  const { toast } = useToast();
  const { data: formEvaluasiData, isLoading } = useFormEvaluasi();
  const updateFormEvaluasi = useUpdateFormEvaluasi();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageProgres, setCurrentPageProgres] = useState(1);
  const [filterStatusProgres, setFilterStatusProgres] = useState<string>("all");
  const [searchQueryProgres, setSearchQueryProgres] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: EvaluationSortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const [sortConfigProgres, setSortConfigProgres] = useState<{
    key: ProgresSortKey;
    direction: "asc" | "desc";
  } | null>(null);
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
  const [tabValue, setTabValue] = useState<TabKey>(defaultTab);
  useEffect(() => {
    setTabValue(defaultTab);
  }, [defaultTab]);
  const approvalFlow = [
    { key: "sekper", label: "Sekretaris Perusahaan", statusKey: "approval1" as const },
    { key: "sevpOperation", label: "SEVP Operation", statusKey: "approval2" as const },
    { key: "finance", label: "Divisi Keuangan", statusKey: "approval3" as const },
    { key: "sevpSupport", label: "SEVP Business Support", statusKey: "approval4" as const },
    { key: "director", label: "Direktur Utama", statusKey: "approval5" as const },
  ];
  type ApprovalFlowKey = (typeof approvalFlow)[number]["key"];
  const [approvalDates, setApprovalDates] = useState<
    Record<string, Partial<Record<ApprovalFlowKey, string>>>
  >({});
  const [editingApproval, setEditingApproval] = useState<
    Record<string, Partial<Record<ApprovalFlowKey, boolean>>>
  >({});

  const handleApprovalDateChange = (formId: string, key: ApprovalFlowKey, value: string) => {
    setApprovalDates((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [key]: value,
      },
    }));
  };

  const isStepCompleted = (record: ProgresRecord, flowIndex: number) => {
    const flowItem = approvalFlow[flowIndex];
    if (!flowItem) return false;
    const dateValue = approvalDates[record.id]?.[flowItem.key];
    if (dateValue) return true;
    const statusValue = record[flowItem.statusKey];
    return statusValue === "approved";
  };

  const isStepUnlocked = (record: ProgresRecord, flowIndex: number) => {
    if (flowIndex === 0) return true;
    return isStepCompleted(record, flowIndex - 1);
  };

  const formatApprovalDate = (value: string) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startEditingApproval = (formId: string, key: ApprovalFlowKey) => {
    setEditingApproval((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [key]: true,
      },
    }));
  };

  const stopEditingApproval = (formId: string, key: ApprovalFlowKey) => {
    setEditingApproval((prev) => ({
      ...prev,
      [formId]: {
        ...(prev[formId] ?? {}),
        [key]: false,
      },
    }));
  };

  const renderApprovalCell = (record: ProgresRecord, flowItem: (typeof approvalFlow)[number], index: number) => {
    const datesForRecord = approvalDates[record.id] ?? {};
    const currentValue = datesForRecord[flowItem.key] ?? "";
    const unlocked = isStepUnlocked(record, index);
    const isCompleted = Boolean(currentValue) || record[flowItem.statusKey] === "approved";
    const isEditing = Boolean(editingApproval[record.id]?.[flowItem.key]);
    const circleBase = "h-7 w-7 rounded-full flex items-center justify-center";

    return (
      <div className="flex items-center justify-center min-h-[48px]">
        {isCompleted ? (
          <div className={`${circleBase} border border-emerald-400 bg-emerald-50 text-emerald-600`}>
            <Check className="h-3.5 w-3.5" />
          </div>
        ) : isEditing ? (
          <Input
            type="date"
            autoFocus
            value={currentValue}
            onChange={(event) => handleApprovalDateChange(record.id, flowItem.key, event.target.value)}
            onBlur={() => stopEditingApproval(record.id, flowItem.key)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.currentTarget.blur();
              }
            }}
            className="h-8 text-xs"
          />
        ) : unlocked ? (
          <button
            onClick={() => startEditingApproval(record.id, flowItem.key)}
            className={`${circleBase} border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10`}
          >
            <PenLine className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className={`${circleBase} border border-muted-foreground/40 bg-transparent`} />
        )}
      </div>
    );
  };

  const itemsPerPage = 10;

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

  const handleSort = (key: EvaluationSortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSortProgres = (key: ProgresSortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfigProgres && sortConfigProgres.key === key && sortConfigProgres.direction === "asc") {
      direction = "desc";
    }
    setSortConfigProgres({ key, direction });
  };

  const handleSendToPengadaan = (noEvaluasi: string) => {
    toast({
      title: "Dikirim ke Pengadaan",
      description: `Form ${noEvaluasi} telah dikirim ke bagian Pengadaan`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter, sort and pagination for Kelengkapan
  const sortedAndFilteredEvaluations = useMemo<FormEvaluasiRecord[]>(() => {
    if (!formEvaluasiData) return [];

    let filtered = formEvaluasiData.filter((ev) => {
      const status = ev.is_final ? "evaluated" : "pending_evaluation";
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesSearch =
        (ev.kode_form?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (ev.pengajuan?.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (ev.pengajuan?.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesStatus && matchesSearch;
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
  }, [formEvaluasiData, filterStatus, searchQuery, sortConfig]);

  // Filter, sort and pagination for Progres
  const sortedAndFilteredProgres = useMemo<ProgresRecord[]>(() => {
    if (!formEvaluasiData) return [];

    let filtered = formEvaluasiData.filter((ev) => {
      const matchesStatus = filterStatusProgres === "all" || ev.is_final === (filterStatusProgres === "selesai");
      const matchesSearch =
        (ev.kode_form?.toLowerCase().includes(searchQueryProgres.toLowerCase()) ?? false) ||
        (ev.pengajuan?.judul?.toLowerCase().includes(searchQueryProgres.toLowerCase()) ?? false);
      return matchesStatus && matchesSearch;
    });

    if (sortConfigProgres) {
      filtered = [...filtered].sort((a, b) =>
        compareValues(
          getProgresSortValue(a, sortConfigProgres.key),
          getProgresSortValue(b, sortConfigProgres.key),
          sortConfigProgres.direction
        )
      );
    }

    return filtered as ProgresRecord[];
  }, [formEvaluasiData, filterStatusProgres, searchQueryProgres, sortConfigProgres]);

  const totalPages = Math.ceil(sortedAndFilteredEvaluations.length / itemsPerPage);
  const paginatedEvaluations = sortedAndFilteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesProgres = Math.ceil(sortedAndFilteredProgres.length / itemsPerPage);
  const paginatedProgres = sortedAndFilteredProgres.slice(
    (currentPageProgres - 1) * itemsPerPage,
    currentPageProgres * itemsPerPage
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Form Evaluasi</h1>
        <p className="text-muted-foreground mt-1">
          Generate dan kelola form evaluasi vendor
        </p>
      </div>

      <Tabs value={tabValue} onValueChange={(value) => setTabValue(value as TabKey)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="kelengkapan">Kelengkapan Evaluasi</TabsTrigger>
          <TabsTrigger value="progres">Progres Dokumen</TabsTrigger>
        </TabsList>

        {/* Tab 1: Kelengkapan Evaluasi */}
        <TabsContent value="kelengkapan" className="space-y-6">
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
                    <SelectItem value="pending_evaluation">Menunggu Evaluasi</SelectItem>
                    <SelectItem value="evaluated">Sudah Dievaluasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Pencarian</Label>
                <Input
                  placeholder="Cari berdasarkan No Evaluasi, No Surat, atau Judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-lg border overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] px-6">
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
                    <TableHead className="w-[140px] px-4">
                      <button onClick={() => handleSort("nilai_pengajuan")} className="flex items-center gap-1 hover:text-foreground">
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
                    <TableHead className="w-[120px] px-4">Kode Form</TableHead>
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
                      evaluation.pengajuan?.no_surat ||
                      (lampiranUrl ? lampiranUrl.split("/").pop() : "-");

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
                            <div
                              className="mt-2 text-xs text-muted-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                        <TableCell className="text-sm px-4 py-2">
                          Rp {evaluation.pengajuan?.nilai_pengajuan?.toLocaleString("id-ID") || 0}
                        </TableCell>
                        <TableCell className="text-sm px-4 py-2">
                          {evaluation.pengajuan?.jenis || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-2 font-mono text-sm text-muted-foreground">
                          {evaluation.kode_form}
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
                                <FileText className="h-1 w-1" />
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
                              className="h-6 px-3 rounded-full border border-[#facc15] bg-[#fef9c3] text-[#ca8a04] hover:bg-[#fde68a] hover;border-[#facc15] hover:text-[#ca8a04] text-[10px] font-semibold"
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
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        {/* Tab 2: Progres Dokumen */}
        <TabsContent value="progres" className="space-y-6">
          {/* Filter Bar for Progres */}
          <div className="bg-card rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatusProgres} onValueChange={setFilterStatusProgres}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="proses">Proses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Pencarian</Label>
                <Input
                  placeholder="Cari berdasarkan No Evaluasi atau Judul..."
                  value={searchQueryProgres}
                  onChange={(e) => setSearchQueryProgres(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] px-6">
                      <button onClick={() => handleSortProgres("kode_form")} className="flex items-center gap-1 hover:text-foreground">
                        No Form Evaluasi
                        <ChevronsUpDown
                          className={cn(
                            "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                            sortConfigProgres?.key === "kode_form" ? "opacity-100" : "opacity-60"
                          )}
                        />
                      </button>
                    </TableHead>
                    <TableHead className="w-[320px] px-4">
                      <button onClick={() => handleSortProgres("judul")} className="flex items-center gap-1 hover:text-foreground">
                        Judul
                        <ChevronsUpDown
                          className={cn(
                            "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                            sortConfigProgres?.key === "judul" ? "opacity-100" : "opacity-60"
                          )}
                        />
                      </button>
                    </TableHead>
                    {approvalFlow.map((flow) => (
                      <TableHead key={flow.key} className="w-[120px] px-4 text-center">
                        {flow.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[120px] px-4 text-center">Lampiran</TableHead>
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
                      progres.pengajuan?.no_surat ||
                      (progresLampiran ? progresLampiran.split("/").pop() : "-");
                    const isFinished = progres.pengajuan?.status === "selesai";

                    return (
                      <TableRow
                        key={progres.id}
                        onClick={() => handleDetail(progres, { readonly: true })}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                      <TableCell className="px-6 py-2 font-mono text-sm text-muted-foreground">{progres.kode_form || "-"}</TableCell>
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
                        <TableCell key={flowItem.key} className="px-4 py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
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
                              <FileText className="h-1 w-1" />
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

          {/* Pagination for Progres */}
          {totalPagesProgres > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPageProgres((p) => Math.max(1, p - 1))}
                    className={currentPageProgres === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(totalPagesProgres)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPageProgres(i + 1)}
                      isActive={currentPageProgres === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPageProgres((p) => Math.min(totalPagesProgres, p + 1))}
                    className={currentPageProgres === totalPagesProgres ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>

      {/* Print Component */}
      {printData && (
        <PrintEvaluasi
          row={printData}
          onClose={() => setPrintData(null)}
        />
      )}

      {/* Detail Dialog */}
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
                  <p className="text-sm text-foreground">{formatCurrency(detailDialog.data.pengajuan?.nilai_pengajuan || 0)}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="text-sm text-foreground">
                    {detailDialog.data.created_at ? new Date(detailDialog.data.created_at).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Lampiran</p>
                  <div>
                    {detailDialog.data.pengajuan?.lampiran_url ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                      >
                        <a
                          href={detailDialog.data.pengajuan.lampiran_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 no-underline text-primary"
                        >
                          <FileText className="h-3 w-3" />
                          {detailDialog.data.pengajuan.no_surat ||
                            detailDialog.data.pengajuan.lampiran_url.split("/").pop()}
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
                        onChange={(e) =>
                          setEvaluatorForm({ ...evaluatorForm, namaAnggaran: e.target.value })
                        }
                        placeholder="Contoh: Belanja Modal TI"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Reg. Anggaran</p>
                      <Input
                        type="number"
                        value={evaluatorForm.regAnggaran}
                        onChange={(e) =>
                          setEvaluatorForm({ ...evaluatorForm, regAnggaran: e.target.value })
                        }
                        placeholder="Nomor registrasi"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Nilai Evaluasi</p>
                      <Input
                        type="number"
                        value={evaluatorForm.nilaiEvaluasi}
                        onChange={(e) =>
                          setEvaluatorForm({ ...evaluatorForm, nilaiEvaluasi: e.target.value })
                        }
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
