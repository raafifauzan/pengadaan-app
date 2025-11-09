import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { TrackingStep } from "@/components/TrackingProgressBar";

type Pengajuan = Tables<"pengajuan">;
type FormEvaluasiRow = Tables<"form_evaluasi">;
type PengadaanRow = Tables<"Pengadaan">;

export interface TrackingItem {
  id: string;
  judul: string | null;
  tanggalPengajuan: string;
  status: string | null;
  nilaiPengajuan: number;
  unit: string | null;
  noSurat: string | null;
  lampiranUrl: string | null;
  currentStep: TrackingStep;
  isRejected: boolean;
}

const mapPengadaanStatusToStep = (status?: string | null): TrackingStep => {
  const value = status?.toLowerCase() ?? "";
  if (!value) return "pengadaan";

  if (value.includes("selesai") || value.includes("completed")) {
    return "pembayaran";
  }
  if (value.includes("delivery")) {
    return "pengadaan";
  }
  if (value.includes("po") || value.includes("issue")) {
    return "pengadaan";
  }
  if (value.includes("waiting")) {
    return "kelengkapan_evaluasi";
  }
  return "pengadaan";
};

const mapPengajuanStatusToStep = (status?: string | null): { step: TrackingStep; rejected: boolean } => {
  if (!status) return { step: "pengajuan", rejected: false };
  const statusLower = status.toLowerCase();

  if (statusLower.includes("batal") || statusLower.includes("reject") || statusLower.includes("ditolak")) {
    return { step: "approval", rejected: true };
  }

  if (statusLower.includes("pembayaran") || statusLower.includes("payment")) return { step: "pembayaran", rejected: false };
  if (statusLower.includes("pengadaan") || statusLower.includes("procurement")) return { step: "pengadaan", rejected: false };
  if (statusLower.includes("kelengkapan") || statusLower.includes("completeness")) return { step: "kelengkapan_evaluasi", rejected: false };
  if (statusLower.includes("evaluasi") || statusLower.includes("evaluation")) return { step: "form_evaluasi", rejected: false };
  if (statusLower.includes("approved") || statusLower.includes("disetujui")) return { step: "approval", rejected: false };
  if (statusLower.includes("pending") || statusLower.includes("menunggu")) return { step: "pengajuan", rejected: false };

  const statusMap: Record<string, TrackingStep> = {
    completed: "pembayaran",
    selesai: "pembayaran",
    in_delivery: "pengadaan",
    po_issued: "pengadaan",
    waiting_po: "kelengkapan_evaluasi",
    evaluated: "kelengkapan_evaluasi",
    pending_evaluation: "form_evaluasi",
    in_progress: "approval",
    approved: "approval",
    rejected: "pengajuan",
  };

  return { step: statusMap[statusLower] || "pengajuan", rejected: false };
};

const determineCurrentStep = (
  pengajuan: Pengajuan,
  evaluasi?: FormEvaluasiRow,
  pengadaan?: PengadaanRow
): { step: TrackingStep; rejected: boolean } => {
  if (pengadaan) {
    return { step: mapPengadaanStatusToStep(pengadaan["STATUS"]), rejected: false };
  }
  if (evaluasi) {
    return { step: evaluasi.is_final ? "kelengkapan_evaluasi" : "form_evaluasi", rejected: false };
  }
  return mapPengajuanStatusToStep(pengajuan.status);
};

// Hook untuk mendapatkan semua tracking data
export function useTracking() {
  return useQuery({
    queryKey: ["tracking"],
    queryFn: async (): Promise<TrackingItem[]> => {
      const [pengajuanRes, evaluasiRes, pengadaanRes] = await Promise.all([
        supabase.from("pengajuan").select("*").order("timestamp", { ascending: false }),
        supabase.from("form_evaluasi").select("*"),
        supabase.from("Pengadaan").select("*"),
      ]);

      if (pengajuanRes.error) throw pengajuanRes.error;
      if (evaluasiRes.error) throw evaluasiRes.error;
      if (pengadaanRes.error) throw pengadaanRes.error;

      const evaluasiMap = new Map<string, FormEvaluasiRow>();
      (evaluasiRes.data ?? []).forEach((row) => {
        if (row.pengajuan_id) {
          evaluasiMap.set(row.pengajuan_id, row);
        }
      });

      const pengadaanMap = new Map<string, PengadaanRow>();
      (pengadaanRes.data ?? []).forEach((row) => {
        const key = row["NOMOR PENGAJUAN / FROM EVALUASI"];
        if (key) {
          pengadaanMap.set(String(key), row);
        }
      });

      return (pengajuanRes.data || []).map((p): TrackingItem => {
        const evaluasiRecord = evaluasiMap.get(p.id);
        const kodeForm = evaluasiRecord?.kode_form;
        const pengadaanRecord =
          (kodeForm && pengadaanMap.get(kodeForm)) ||
          pengadaanMap.get(p.id) ||
          (p.no_surat ? pengadaanMap.get(p.no_surat) : undefined);

        const { step, rejected } = determineCurrentStep(p, evaluasiRecord, pengadaanRecord);

        return {
          id: p.id,
          judul: p.judul,
          tanggalPengajuan: p.timestamp || p.tgl_surat || new Date().toISOString(),
          status: p.status,
          nilaiPengajuan: p.nilai_pengajuan || 0,
          unit: p.unit,
          noSurat: p.no_surat,
          lampiranUrl: (p as any).lampiran_url ?? null,
          currentStep: step,
          isRejected: rejected,
        };
      });
    },
    refetchInterval: 30000, // Refetch setiap 30 detik
  });
}

