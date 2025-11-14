export interface TableColumnConfig<Key extends string = string> {
  key: Key;
  label: string;
  basis: number;
  minWidth?: number;
  shrink?: number;
  align: string;
  justify: string;
  headPadding: string;
  cellPadding: string;
  sortable?: boolean;
  sortKey?: string;
}

export type ProcurementColumnKey =
  | "date"
  | "title"
  | "value"
  | "jenis"
  | "unit"
  | "status";

export const PROCUREMENT_TABLE_COLUMNS: TableColumnConfig<ProcurementColumnKey>[] =
  [
    {
      key: "date",
      label: "Tanggal",
      basis: 150,
      minWidth: 120,
      align: "text-left",
      justify: "justify-start",
      headPadding: "pl-5 pr-1.5",
      cellPadding: "pl-5 pr-1.5",
      sortable: true,
      sortKey: "tgl_surat",
    },
    {
      key: "title",
      label: "Paket Pengajuan",
      basis: 350,
      minWidth: 300,
      align: "text-left",
      justify: "justify-start",
      headPadding: "px-1.5",
      cellPadding: "px-1.5",
      sortable: true,
      sortKey: "judul",
    },
    {
      key: "value",
      label: "Nilai Project",
      basis: 180,
      align: "text-right",
      justify: "justify-end",
      headPadding: "px-0",
      cellPadding: "px-2.5",
      sortable: true,
      sortKey: "nilai_pengajuan",
    },
    {
      key: "jenis",
      label: "Jenis Project",
      basis: 170,
      minWidth: 150,
      align: "text-center",
      justify: "justify-center",
      headPadding: "px-1.5",
      cellPadding: "px-1.5",
      sortable: true,
      sortKey: "jenis",
    },
    {
      key: "unit",
      label: "Bagian / Unit",
      basis: 150,
      minWidth: 140,
      align: "text-center",
      justify: "justify-center",
      headPadding: "px-1.5",
      cellPadding: "px-1.5",
      sortable: true,
      sortKey: "unit",
    },
    {
      key: "status",
      label: "Status & Aksi",
      basis: 140,
      minWidth: 140,
      align: "text-center",
      justify: "justify-center",
      headPadding: "px-1.5",
      cellPadding: "px-1.5",
    },
  ];

export type EvaluationColumnKey =
  | "created_at"
  | "judul"
  | "nilai"
  | "jenis_project"
  | "kode_form"
  | "status";

export const EVALUATION_TABLE_COLUMNS: TableColumnConfig<EvaluationColumnKey>[] =
  [
    {
      key: "created_at",
      label: "Tanggal Evaluator",
      basis: 150,
      minWidth: 140,
      align: "text-left",
      justify: "justify-start",
      headPadding: "pl-4 pr-2",
      cellPadding: "pl-4 pr-2",
      sortable: true,
      sortKey: "created_at",
    },
    {
      key: "judul",
      label: "Paket Pengajuan",
      basis: 300,
      minWidth: 280,
      align: "text-left",
      justify: "justify-start",
      headPadding: "px-4",
      cellPadding: "px-4",
      sortable: true,
      sortKey: "judul",
    },
    {
      key: "nilai",
      label: "Nilai Project",
      basis: 160,
      align: "text-right",
      justify: "justify-end",
      headPadding: "pl-2 pr-4",
      cellPadding: "pl-2 pr-4",
      sortable: true,
      sortKey: "nilai_pengajuan",
    },
    {
      key: "jenis_project",
      label: "Jenis Project",
      basis: 140,
      align: "text-center",
      justify: "justify-center",
      headPadding: "px-3",
      cellPadding: "px-3",
    },
    {
      key: "kode_form",
      label: "Kode Form",
      basis: 160,
      align: "text-left",
      justify: "justify-start",
      headPadding: "px-4",
      cellPadding: "px-4",
    },
    {
      key: "status",
      label: "Status & Aksi",
      basis: 200,
      align: "text-center",
      justify: "justify-center",
      headPadding: "px-4",
      cellPadding: "px-4",
    },
  ];

export type PengadaanColumnKey =
  | "tanggal_pengajuan"
  | "paket_pengajuan"
  | "hps"
  | "jenis"
  | "metode"
  | "status_aksi";

export const PENGADAAN_TABLE_COLUMNS: TableColumnConfig<PengadaanColumnKey>[] = [
  {
    key: "tanggal_pengajuan",
    label: "Tgl Pengadaan",
    basis: 120,
    minWidth: 120,
    align: "text-left",
    justify: "justify-start",
    headPadding: "px-6",
    cellPadding: "px-6",
    sortable: true,
    sortKey: "pengajuan_tanggal",
  },
  {
    key: "paket_pengajuan",
    label: "Paket Pengajuan",
    basis: 260,
    minWidth: 250,
    align: "text-left",
    justify: "justify-start",
    headPadding: "px-2",
    cellPadding: "px-2",
    sortable: true,
    sortKey: "pengajuan_judul",
  },
  {
    key: "hps",
    label: "Nilai Project",
    basis: 120,
    align: "text-right",
    justify: "justify-end",
    headPadding: "px-5",
    cellPadding: "px-8",
    sortable: true,
    sortKey: "form_evaluasi_anggaran_hps",
  },
  {
    key: "jenis",
    label: "Jenis",
    basis: 90,
    align: "text-left",
    justify: "justify-start",
    headPadding: "px-5",
    cellPadding: "px-5",
    sortable: true,
    sortKey: "pengajuan_jenis",
  },
  {
    key: "metode",
    label: "Metode",
    basis: 150,
    align: "text-left",
    justify: "justify-start",
    headPadding: "px-2",
    cellPadding: "px-2",
    sortable: true,
    sortKey: "metode_nama",
  },
  {
    key: "status_aksi",
    label: "Status",
    basis: 160,
    align: "text-left",
    justify: "justify-start",
    headPadding: "px-2",
    cellPadding: "px-2",
  },
];

export const TABLE_LAYOUT = {
  rowGap: "gap-2.5",
  headerTextPadding: "px-2.5",
  rowPadding: "py-2",
  headerTextClass: "text-sm font-semibold text-muted-foreground",
  headerHeight: "min-h-[48px]",
  rowBaseClass: "flex items-center",
  sortButtonGap: "gap-[2px]",
  sortIconClass: "h-2.5 w-2.5 text-muted-foreground/80",
} as const;


