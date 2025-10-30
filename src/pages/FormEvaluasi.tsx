import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileText, Upload } from "lucide-react";
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
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    data: EvaluationRequest | null;
  }>({ open: false, data: null });
  const [evaluatorForm, setEvaluatorForm] = useState({
    sumberAnggaran: "",
    namaAnggaran: "",
    regAnggaran: "",
    nilaiEvaluasi: "",
  });

  const itemsPerPage = 10;

  const handlePrint = (noEvaluasi: string) => {
    toast({
      title: "Generate Form Evaluasi",
      description: `Mencetak form evaluasi ${noEvaluasi}`,
    });
    window.print();
  };

  const handleDetail = (evaluation: EvaluationRequest) => {
    setDetailDialog({ open: true, data: evaluation });
    if (evaluation.sumberAnggaran) {
      setEvaluatorForm({
        sumberAnggaran: evaluation.sumberAnggaran,
        namaAnggaran: evaluation.namaAnggaran || "",
        regAnggaran: evaluation.regAnggaran?.toString() || "",
        nilaiEvaluasi: evaluation.nilaiEvaluasi?.toString() || "",
      });
    }
  };

  const handleSubmitEvaluator = () => {
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

  // Filter and pagination for Kelengkapan
  const filteredEvaluations = mockEvaluations.filter((ev) => {
    const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
    const matchesSearch =
      ev.noEvaluasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const paginatedEvaluations = filteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Evaluasi</h1>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No Evaluasi</TableHead>
                  <TableHead>No Surat</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Bagian/Unit</TableHead>
                  <TableHead>Requestor</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">{evaluation.noEvaluasi}</TableCell>
                    <TableCell>{evaluation.noSurat}</TableCell>
                    <TableCell>{evaluation.title}</TableCell>
                    <TableCell>{evaluation.department}</TableCell>
                    <TableCell className="text-sm">{evaluation.requestor}</TableCell>
                    <TableCell>{evaluation.jenisPengajuan}</TableCell>
                    <TableCell>{formatCurrency(evaluation.amount)}</TableCell>
                    <TableCell>
                      {new Date(evaluation.approvedDate).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={evaluation.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDetail(evaluation)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handlePrint(evaluation.noEvaluasi)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <div className="bg-card rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No Form Evaluasi</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Bagian/Unit</TableHead>
                  <TableHead className="text-center">Apv 1</TableHead>
                  <TableHead className="text-center">Apv 2</TableHead>
                  <TableHead className="text-center">Apv 3</TableHead>
                  <TableHead className="text-center">Apv 4</TableHead>
                  <TableHead className="text-center">Apv 5</TableHead>
                  <TableHead>Lampiran</TableHead>
                  <TableHead className="text-right">Status & Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProgres.map((progres) => (
                  <TableRow key={progres.id}>
                    <TableCell className="font-medium">{progres.noEvaluasi}</TableCell>
                    <TableCell>{progres.title}</TableCell>
                    <TableCell>{progres.department}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={progres.approval1} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={progres.approval2} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={progres.approval3} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={progres.approval4} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={progres.approval5} />
                    </TableCell>
                    <TableCell>
                      {progres.lampiran ? (
                        <span className="text-sm text-muted-foreground">{progres.lampiran}</span>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <StatusBadge
                          status={
                            progres.status === "selesai"
                              ? "completed"
                              : progres.status === "revisi"
                              ? "rejected"
                              : "in_progress"
                          }
                        />
                        {progres.status === "selesai" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendToPengadaan(progres.noEvaluasi)}
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
        </TabsContent>
      </Tabs>

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
                    <p className="font-medium">{detailDialog.data.noEvaluasi}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No Surat</p>
                    <p className="font-medium">{detailDialog.data.noSurat}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Judul Pengajuan</p>
                    <p className="font-medium">{detailDialog.data.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bagian/Unit</p>
                    <p className="font-medium">{detailDialog.data.department}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requestor</p>
                    <p className="font-medium">{detailDialog.data.requestor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jenis Pengajuan</p>
                    <p className="font-medium">{detailDialog.data.jenisPengajuan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nilai Pengadaan</p>
                    <p className="font-medium">{formatCurrency(detailDialog.data.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <StatusBadge status={detailDialog.data.status} />
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
