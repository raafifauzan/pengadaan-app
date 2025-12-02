import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcurementStats {
  disposisiMemo: number;
  approvalFormEvaluasi: number;
  approvalFormHPS: number;
  pengadaan: number;
  pembayaran: number;
  selesai: number;
}

export function useProcurementStats() {
  return useQuery({
    queryKey: ["procurement-stats"],
    queryFn: async (): Promise<ProcurementStats> => {
      // Get all pengajuan with their related data
      const { data: pengajuanData, error: pengajuanError } = await supabase
        .from("pengajuan")
        .select("id, status, nilai_pengajuan");

      if (pengajuanError) throw pengajuanError;

      // Get form evaluasi data
      const { data: evaluasiData, error: evaluasiError } = await supabase
        .from("form_evaluasi")
        .select("pengajuan_id, is_final");

      if (evaluasiError) throw evaluasiError;

      // Get pengadaan data
      const { data: pengadaanData, error: pengadaanError } = await supabase
        .from("pengadaan")
        .select("form_evaluasi_id, status_pengadaan");

      if (pengadaanError) throw pengadaanError;

      const stats: ProcurementStats = {
        disposisiMemo: 0,
        approvalFormEvaluasi: 0,
        approvalFormHPS: 0,
        pengadaan: 0,
        pembayaran: 0,
        selesai: 0,
      };

      // Create lookup maps
      const evaluasiMap = new Map(
        evaluasiData.map((e) => [e.pengajuan_id, e])
      );
      const pengadaanByEvaluasi = new Map(
        pengadaanData.map((p) => [p.form_evaluasi_id, p])
      );

      // Count items in each stage
      pengajuanData.forEach((p) => {
        const evaluasi = evaluasiMap.get(p.id);
        const status = p.status?.toLowerCase() || "";

        // Disposisi Memo - new submissions
        if (status.includes("pending") || status.includes("menunggu")) {
          stats.disposisiMemo++;
          return;
        }

        // Approval Form Evaluasi - in approval process
        if (
          status.includes("waiting") ||
          status.includes("approval") ||
          (!evaluasi && (status.includes("approved") || status.includes("disetujui")))
        ) {
          stats.approvalFormEvaluasi++;
          return;
        }

        // If has evaluasi record
        if (evaluasi) {
          const evaluasiId = (evaluasi as any).id;
          const pengadaan = pengadaanByEvaluasi.get(evaluasiId);

          // Approval Form HPS - untuk nilai > 200 juta dan belum final
          if (p.nilai_pengajuan > 200000000 && !evaluasi.is_final) {
            stats.approvalFormHPS++;
            return;
          }

          // If has pengadaan record
          if (pengadaan) {
            const pengadaanStatus = pengadaan.status_pengadaan?.toLowerCase() || "";

            // Selesai
            if (pengadaanStatus.includes("selesai") || pengadaanStatus.includes("completed")) {
              stats.selesai++;
              return;
            }

            // Pembayaran
            if (pengadaanStatus.includes("delivery") || pengadaanStatus.includes("in_delivery")) {
              stats.pembayaran++;
              return;
            }

            // Pengadaan in progress
            stats.pengadaan++;
            return;
          }

          // Has evaluasi but no pengadaan yet - still in approval
          if (evaluasi.is_final) {
            stats.approvalFormEvaluasi++;
          } else {
            stats.approvalFormHPS++;
          }
        }
      });

      return stats;
    },
    refetchInterval: 30000,
  });
}
