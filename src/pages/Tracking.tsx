import { useMemo, useState } from "react";
import { Loader2, AlertCircle, Search, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrackingProgressBar } from "@/components/TrackingProgressBar";
import { useTracking } from "@/hooks/useTracking";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrackingStep } from "@/components/TrackingProgressBar";
import { cn } from "@/lib/utils";

export default function Tracking() {
  const { data: trackingData, isLoading, error } = useTracking();
  const [searchQuery, setSearchQuery] = useState("");
  const [stepFilter, setStepFilter] = useState<TrackingStep | "all">("all");

  const stepOrder: TrackingStep[] = [
    "pengajuan",
    "approval",
    "form_evaluasi",
    "kelengkapan_evaluasi",
    "pengadaan",
    "pembayaran",
  ];

  const [sortConfig, setSortConfig] = useState<{ key: "date" | "progress"; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });

  const filteredData = useMemo(() => {
    if (!trackingData) return [];

    const query = searchQuery.toLowerCase().trim();

    const filtered = trackingData.filter((item) => {
      const matchQuery =
        !query ||
        [item.judul, item.noSurat, item.unit]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(query));

      const matchStep = stepFilter === "all" || item.currentStep === stepFilter;

      return matchQuery && matchStep;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === "date") {
        const dateA = new Date(a.tanggalPengajuan).getTime();
        const dateB = new Date(b.tanggalPengajuan).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      const dateA = new Date(a.tanggalPengajuan).getTime();
      const dateB = new Date(b.tanggalPengajuan).getTime();
      const stepA = stepOrder.indexOf(a.currentStep);
      const stepB = stepOrder.indexOf(b.currentStep);
      if (stepA === stepB) {
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      return sortConfig.direction === "asc" ? stepA - stepB : stepB - stepA;
    });

    return sorted;
  }, [trackingData, searchQuery, stepFilter, sortConfig, stepOrder]);

  const handleSortChange = (key: "date" | "progress") => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "date" ? "desc" : "asc" };
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Tracking Pengajuan</h1>
        <p className="text-muted-foreground mt-1">
          Monitor status dan progress pengajuan procurement
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Memuat data tracking...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data tracking. Silakan coba lagi atau hubungi administrator.
            <br />
            <span className="text-xs mt-2 block">
              {error instanceof Error ? error.message : "Unknown error"}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Pencarian</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari judul / nomor surat / unit..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium">Filter Progres</p>
                <Select value={stepFilter} onValueChange={(value) => setStepFilter(value as TrackingStep | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua progres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua progres</SelectItem>
                    {stepOrder.map((step) => (
                      <SelectItem key={step} value={step}>
                        {step.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          <div className="bg-card rounded-lg border overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    <button
                      onClick={() => handleSortChange("date")}
                      className="flex items-center gap-1 text-left hover:text-foreground"
                    >
                      Tanggal
                      <ChevronsUpDown
                        className={cn(
                          "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                          sortConfig.key === "date" ? "opacity-100" : "opacity-70"
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[200px] md:min-w-[380px]">Judul Pengajuan</TableHead>
                  <TableHead className="min-w-[300px] md:min-w-[420px]">
                    <button
                      onClick={() => handleSortChange("progress")}
                      className="flex items-center gap-1 text-left hover:text-foreground"
                    >
                      Progres Terkini
                      <ChevronsUpDown
                        className={cn(
                          "h-2.5 w-2.5 text-muted-foreground transition-opacity",
                          sortConfig.key === "progress" ? "opacity-100" : "opacity-70"
                        )}
                      />
                    </button>
                  </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="text-sm [&>td]:py-2 [&>td]:align-middle"
                      >
                        <TableCell className="align-middle">
                          {format(new Date(item.tanggalPengajuan), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-sm w-[300px] max-w-[320px] whitespace-normal break-words">
                          <div className="space-y-2">
                            <p className="leading-snug text-sm text-foreground">
                              {item.judul || "Tanpa Judul"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {item.lampiranUrl ? (
                                <Badge
                                  variant="outline"
                                  className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 hover:bg-primary/10 transition-colors"
                                >
                                  <a
                                    href={item.lampiranUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 no-underline text-primary"
                                  >
                                    {item.noSurat || item.lampiranUrl.split("/").pop()}
                                  </a>
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[11px] font-medium bg-white text-muted-foreground border-muted/30 px-1.5 py-0.5"
                                >
                                  {item.noSurat || "No surat belum tersedia"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[600px] md:w-[700px]">
                          <TrackingProgressBar currentStep={item.currentStep} isRejected={item.isRejected} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {trackingData && trackingData.length > 0
                          ? "Data tidak ditemukan sesuai pencarian/filter."
                          : "Belum ada data tracking"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
