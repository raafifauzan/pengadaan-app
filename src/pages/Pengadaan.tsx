import { useMemo, useState } from "react";
import { Settings, ChevronsUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProcurementFilterBar } from "@/components/ProcurementFilterBar";
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
  type PengadaanWithRelations,
} from "@/hooks/usePengadaan";

type ColumnKey =
  | "tanggal_pengajuan"
  | "paket_pengajuan"
  | "jenis"
  | "metode"
  | "hps"
  | "status_aksi";

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  sortable?: boolean;
  sortKey?: keyof PengadaanWithRelations | "pengajuan_tanggal";
  align?: "left" | "center" | "right";
}

const COLUMNS: ColumnConfig[] = [
  {
    key: "tanggal_pengajuan",
    label: "Tanggal",
    sortable: true,
    sortKey: "pengajuan_tanggal",
    align: "left",
  },
  {
    key: "paket_pengajuan",
    label: "Paket Pengajuan",
    sortable: true,
    sortKey: "pengajuan_judul",
    align: "left",
  },
  {
    key: "hps",
    label: "Nilai Project", // sebelumnya "Nilai HPS"
    sortable: true,
    sortKey: "form_evaluasi_anggaran_hps",
    align: "right",
  },
  {
    key: "jenis",
    label: "Jenis",
    sortable: true,
    sortKey: "pengajuan_jenis",
    align: "left",
  },
  {
    key: "metode",
    label: "Metode",
    sortable: true,
    sortKey: "metode_nama",
    align: "left",
  },
  {
    key: "status_aksi",
    label: "Status & Aksi",
    sortable: false,
    align: "center",
  },
];


const formatStatusLabel = (status: string) => {
  if (!status) return "-";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

export default function Pengadaan() {
  const { toast } = useToast();
  const { data: pengadaanData, isLoading } = usePengadaan();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMetode, setFilterMetode] = useState<string>("all");
  const [nilaiFilter, setNilaiFilter] = useState<[number, number]>([0, 0]); // belum dipakai
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
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

  const handleSort = (col: ColumnConfig) => {
    if (!col.sortable) return;
    const key = (col.sortKey ?? col.key) as string;

    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
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
        const key = sortConfig.key as keyof PengadaanWithRelations;

        if (key === "pengajuan_tanggal") {
          const aTime = a.pengajuan_tanggal
            ? new Date(a.pengajuan_tanggal).getTime()
            : 0;
          const bTime = b.pengajuan_tanggal
            ? new Date(b.pengajuan_tanggal).getTime()
            : 0;
          return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
        }

        const aVal = (a as any)[key];
        const bVal = (b as any)[key];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
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

  const handleLihatDetail = (row: PengadaanWithRelations) => {
    toast({
      title: "Detail Pengadaan",
      description: `Pengajuan: ${
        row.pengajuan_judul ?? "-"
      } (${row.form_evaluasi_kode ?? row.kode_form})`,
    });
  };

  const renderCell = (row: PengadaanWithRelations, col: ColumnKey) => {
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
        const hps = (row as any).form_evaluasi_anggaran_hps as
          | number
          | null
          | undefined;
        return (
          <span className="text-sm text-foreground">
            {formatNumberId(hps)}
          </span>
        );
      }

      case "status_aksi": {
        const status = row.status_pengadaan || "draft";
        const isDraft = status.toLowerCase() === "draft";
        return (
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant={isDraft ? "outline" : "secondary"}
              className={`px-2 py-0.5 text-[11px] font-medium ${
                isDraft
                  ? "border-amber-300 text-amber-700 bg-amber-50"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {formatStatusLabel(status)}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full border border-muted-foreground/20 hover:bg-muted/60"
              onClick={(e) => {
                e.stopPropagation();
                handleLihatDetail(row);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
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
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2 text-xs font-semibold text-muted-foreground ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.label}
                      <ChevronsUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedPengadaan.map((row) => (
              <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 align-mid ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {renderCell(row, col.key)}
                  </td>
                ))}
              </tr>
            ))}

            {paginatedPengadaan.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data pengadaan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </div>
  );
}
