import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileText, Upload, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormEvaluasi, useUpdateFormEvaluasi } from "@/hooks/useFormEvaluasi";
import PrintEvaluasi from "@/components/PrintEvaluasi";
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

export default function FormEvaluasi() {
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
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [sortConfigProgres, setSortConfigProgres] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    data: any | null;
  }>({ open: false, data: null });
  const [evaluatorForm, setEvaluatorForm] = useState({
    sumberAnggaran: "",
    namaAnggaran: "",
    regAnggaran: "",
    nilaiEvaluasi: "",
  });
  const [printData, setPrintData] = useState<any>(null);

  const itemsPerPage = 10;

  const handlePrint = (formEv: any) => {
    const printRow = {
      kodeForm: formEv.kode_form,
      tanggalForm: formEv.created_at || formEv.pengajuan?.timestamp,
      judul: formEv.pengajuan?.judul || "",
      noSurat: formEv.pengajuan?.no_surat || "",
      unit: formEv.pengajuan?.unit || "",
      jenis: formEv.pengajuan?.jenis || "",
      nilaiPengajuan: formEv.pengajuan?.nilai_pengajuan || 0,
      anggaranHps: formEv.anggaran_hps || 0,
      namaAnggaran: formEv.nama_anggaran || "",
      regAnggaran: formEv.reg_anggaran || "",
      isFinal: formEv.is_final || false,
    };
    setPrintData(printRow);
  };

  const handleDetail = (formEv: any) => {
    setDetailDialog({ open: true, data: formEv });
    setEvaluatorForm({
      sumberAnggaran: formEv.pengajuan?.jenis || "",
      namaAnggaran: formEv.nama_anggaran || "",
      regAnggaran: formEv.reg_anggaran || "",
      nilaiEvaluasi: formEv.anggaran_hps?.toString() || "",
    });
  };

  const handleSubmitEvaluator = async () => {
    if (!detailDialog.data) return;

    try {
      await updateFormEvaluasi.mutateAsync({
        id: detailDialog.data.id,
        updates: {
          nama_anggaran: evaluatorForm.namaAnggaran,
          reg_anggaran: evaluatorForm.regAnggaran,
          anggaran_hps: parseFloat(evaluatorForm.nilaiEvaluasi) || 0,
        },
      });

      toast({
        title: "Data Evaluasi Tersimpan",
        description: "Data evaluasi berhasil disimpan",
      });
      setDetailDialog({ open: false, data: null });
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

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSortProgres = (key: string) => {
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
  const sortedAndFilteredEvaluations = useMemo(() => {
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
      filtered = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key === "nilai_pengajuan") {
          aValue = a.pengajuan?.nilai_pengajuan;
          bValue = b.pengajuan?.nilai_pengajuan;
        } else if (sortConfig.key === "judul") {
          aValue = a.pengajuan?.judul;
          bValue = b.pengajuan?.judul;
        } else if (sortConfig.key === "unit") {
          aValue = a.pengajuan?.unit;
          bValue = b.pengajuan?.unit;
        } else {
          aValue = a[sortConfig.key as keyof typeof a];
          bValue = b[sortConfig.key as keyof typeof b];
        }

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
  }, [formEvaluasiData, filterStatus, searchQuery, sortConfig]);

  // Filter, sort and pagination for Progres
  const sortedAndFilteredProgres = useMemo(() => {
    if (!formEvaluasiData) return [];

    let filtered = formEvaluasiData.filter((ev) => {
      const matchesStatus = filterStatusProgres === "all" || ev.is_final === (filterStatusProgres === "selesai");
      const matchesSearch =
        (ev.kode_form?.toLowerCase().includes(searchQueryProgres.toLowerCase()) ?? false) ||
        (ev.pengajuan?.judul?.toLowerCase().includes(searchQueryProgres.toLowerCase()) ?? false);
      return matchesStatus && matchesSearch;
    });

    if (sortConfigProgres) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfigProgres.key === "judul") {
          aValue = a.pengajuan?.judul;
          bValue = b.pengajuan?.judul;
        } else if (sortConfigProgres.key === "unit") {
          aValue = a.pengajuan?.unit;
          bValue = b.pengajuan?.unit;
        } else {
          aValue = a[sortConfigProgres.key as keyof typeof a];
          bValue = b[sortConfigProgres.key as keyof typeof b];
        }

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfigProgres.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return sortConfigProgres.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfigProgres.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
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

      <Tabs defaultValue="kelengkapan" className="space-y-6">
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
                    <TableHead className="w-[120px]">
                      <button onClick={() => handleSort("created_at")} className="flex items-center gap-1 hover:text-foreground">
                        Tanggal Pengajuan <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      <button onClick={() => handleSort("judul")} className="flex items-center gap-1 hover:text-foreground">
                        Judul Pengajuan <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[140px]">
                      <button onClick={() => handleSort("nilai_pengajuan")} className="flex items-center gap-1 hover:text-foreground">
                        Nilai Project <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[140px]">Jenis Project</TableHead>
                    <TableHead className="w-[120px]">Kode Form</TableHead>
                    <TableHead className="w-[100px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvaluations.map((evaluation) => (
                    <TableRow 
                      key={evaluation.id}
                      onClick={() => handleDetail(evaluation)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium text-sm">
                        {evaluation.pengajuan?.timestamp ? new Date(evaluation.pengajuan.timestamp).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div className="font-semibold">{evaluation.pengajuan?.judul || "Tanpa Judul"}</div>
                          {evaluation.pengajuan?.no_surat && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {evaluation.pengajuan.no_surat}
                            </div>
                          )}
                          {evaluation.pengajuan?.unit && (
                            <div className="text-xs text-muted-foreground">
                              {evaluation.pengajuan.unit}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        Rp {evaluation.pengajuan?.nilai_pengajuan?.toLocaleString("id-ID") || 0}
                      </TableCell>
                      <TableCell className="text-sm">
                        {evaluation.pengajuan?.jenis || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {evaluation.kode_form}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={() => handlePrint(evaluation)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Print
                          </Button>
                        </div>
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
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">
                      <Button variant="ghost" size="sm" onClick={() => handleSortProgres("kode_form")} className="h-8 px-2">
                        No Form Evaluasi <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[540px]">
                      <Button variant="ghost" size="sm" onClick={() => handleSortProgres("judul")} className="h-8 px-2">
                        Judul <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <Button variant="ghost" size="sm" onClick={() => handleSortProgres("unit")} className="h-8 px-2">
                        Bagian/Unit <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px]">Apv 1</TableHead>
                    <TableHead className="w-[80px]">Apv 2</TableHead>
                    <TableHead className="w-[80px]">Apv 3</TableHead>
                    <TableHead className="w-[80px]">Apv 4</TableHead>
                    <TableHead className="w-[80px]">Apv 5</TableHead>
                    <TableHead className="w-[100px]">Lampiran</TableHead>
                    <TableHead className="w-[160px] text-right">Status & Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProgres.map((progres) => (
                    <TableRow key={progres.id}>
                      <TableCell className="font-medium text-sm">{progres.kode_form || "-"}</TableCell>
                      <TableCell className="text-sm">{progres.pengajuan?.judul || "-"}</TableCell>
                      <TableCell className="text-sm">{progres.pengajuan?.unit || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status="pending" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="pending" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="pending" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="pending" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="pending" />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast({ title: "Upload", description: "Upload lampiran" })}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col gap-1 items-end">
                          <StatusBadge
                            status={progres.is_final ? "completed" : "in_progress"}
                          />
                          {progres.is_final && (
                            <Button
                              size="sm"
                              onClick={() => handleSendToPengadaan(progres.kode_form)}
                              className="mt-1"
                            >
                              Kirim ke Pengadaan
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, data: null })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Evaluasi</DialogTitle>
          </DialogHeader>
          {detailDialog.data && (
            <div className="space-y-6">
              {/* Data View (2 columns) */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No Evaluasi</p>
                    <p className="font-medium">{detailDialog.data.kode_form || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No Surat</p>
                    <p className="font-medium">{detailDialog.data.pengajuan?.no_surat || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Judul Pengajuan</p>
                    <p className="font-medium">{detailDialog.data.pengajuan?.judul || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bagian/Unit</p>
                    <p className="font-medium">{detailDialog.data.pengajuan?.unit || "-"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jenis Pengajuan</p>
                    <p className="font-medium">{detailDialog.data.pengajuan?.jenis || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nilai Pengajuan</p>
                    <p className="font-medium">{formatCurrency(detailDialog.data.pengajuan?.nilai_pengajuan || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</p>
                    <p className="font-medium">
                      {detailDialog.data.created_at ? new Date(detailDialog.data.created_at).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluator Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Form Evaluator</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sumber Anggaran</Label>
                    <Select
                      value={evaluatorForm.sumberAnggaran}
                      onValueChange={(val) =>
                        setEvaluatorForm({ ...evaluatorForm, sumberAnggaran: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sumber" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APBN">APBN</SelectItem>
                        <SelectItem value="APBD">APBD</SelectItem>
                        <SelectItem value="DANA_HIBAH">Dana Hibah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Anggaran</Label>
                    <Input
                      value={evaluatorForm.namaAnggaran}
                      onChange={(e) =>
                        setEvaluatorForm({ ...evaluatorForm, namaAnggaran: e.target.value })
                      }
                      placeholder="Contoh: Belanja Modal TI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reg. Anggaran</Label>
                    <Input
                      type="number"
                      value={evaluatorForm.regAnggaran}
                      onChange={(e) =>
                        setEvaluatorForm({ ...evaluatorForm, regAnggaran: e.target.value })
                      }
                      placeholder="Nomor registrasi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nilai Evaluasi</Label>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog({ open: false, data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEvaluator}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
