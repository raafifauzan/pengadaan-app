import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, FileText, ArrowUpDown, Eye } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Pengajuan() {
  const { toast } = useToast();
  const { data: pengajuanData, isLoading } = usePengajuan();
  const updatePengajuan = useUpdatePengajuan();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewDetail = (item: any) => {
    setSelectedRequest(item);
    setIsDetailOpen(true);
  };

  // Filter and sort logic
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

  const pendingApprovals = useMemo(() => {
    return pengajuanData?.filter((p) => p.status === "pending") || [];
  }, [pengajuanData]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pengajuan & Approval</h1>
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

        <Tabs defaultValue="pengajuan" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pengajuan">Pengajuan</TabsTrigger>
            <TabsTrigger value="approval">
              Approval
              {pendingApprovals.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pengajuan" className="mt-6 space-y-4">
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
                    placeholder="Cari berdasarkan No Surat atau Judul..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-lg border overflow-x-auto">
              <div className="min-w-[1000px]">
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
                      <TableHead className="w-[160px]">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("nilai_pengajuan")} className="h-8 px-2">
                          Nilai <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <Button variant="ghost" size="sm" onClick={() => handleSort("tgl_surat")} className="h-8 px-2">
                          Tanggal <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[80px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndFilteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium text-sm">{request.no_surat || "-"}</TableCell>
                        <TableCell className="text-sm">{request.judul || "-"}</TableCell>
                        <TableCell className="text-sm">{request.unit || "-"}</TableCell>
                        <TableCell className="text-sm">{request.jenis || "-"}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(request.nilai_pengajuan || 0)}</TableCell>
                        <TableCell className="text-sm">{formatDate(request.tgl_surat)}</TableCell>
                        <TableCell>
                          <StatusBadge status={request.status as any || "pending"} />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetail(request)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approval" className="mt-6">
            {pendingApprovals.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Tidak ada pengajuan yang perlu di-review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingApprovals.map((request) => (
                  <Card
                    key={request.id}
                    className="shadow-md hover:shadow-xl transition-all duration-300 border-2 border-warning/30"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm px-3 py-1 bg-warning/10 text-warning rounded-md font-semibold">
                                {request.no_surat || "-"}
                              </span>
                              <StatusBadge status="pending" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold mb-1">{request.judul}</h3>
                              <p className="text-muted-foreground">{request.catatan || "-"}</p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Unit: </span>
                                <span className="font-medium">{request.unit}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Jenis: </span>
                                <span className="font-medium">{request.jenis}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tanggal: </span>
                                <span className="font-medium">{formatDate(request.tgl_surat)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(request.nilai_pengajuan || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border">
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="outline"
                            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Tolak
                          </Button>
                          <Button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 bg-gradient-to-r from-success to-success hover:shadow-lg"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Setujui
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pengajuan</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">No. Surat</p>
                    <p className="font-medium">{selectedRequest.no_surat || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Surat</p>
                    <p className="font-medium">{formatDate(selectedRequest.tgl_surat)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Judul</p>
                    <p className="font-medium">{selectedRequest.judul}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit</p>
                    <p className="font-medium">{selectedRequest.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis</p>
                    <p className="font-medium">{selectedRequest.jenis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai Pengajuan</p>
                    <p className="font-medium text-lg text-primary">
                      {formatCurrency(selectedRequest.nilai_pengajuan || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={selectedRequest.status || "pending"} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Catatan</p>
                    <p className="font-medium">{selectedRequest.catatan || "-"}</p>
                  </div>
                  {selectedRequest.lampiran_url && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-2">Lampiran</p>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedRequest.lampiran_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Lihat Lampiran
                        </a>
                      </Button>
                    </div>
                  )}
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
    </div>
  );
}
