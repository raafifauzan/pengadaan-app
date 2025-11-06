import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Pengajuan = Tables<"pengajuan">;

export interface TrackingItem {
  id: string;
  judul: string | null;
  tanggalPengajuan: string;
  status: string | null;
  nilaiPengajuan: number;
  unit: string | null;
  noSurat: string | null;
}

// Hook untuk mendapatkan semua tracking data
export function useTracking() {
  return useQuery({
    queryKey: ["tracking"],
    queryFn: async (): Promise<TrackingItem[]> => {
      const { data: pengajuan, error } = await supabase
        .from("pengajuan")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return (pengajuan || []).map((p): TrackingItem => ({
        id: p.id,
        judul: p.judul,
        tanggalPengajuan: p.timestamp || p.tgl_surat || new Date().toISOString(),
        status: p.status,
        nilaiPengajuan: p.nilai_pengajuan || 0,
        unit: p.unit,
        noSurat: p.no_surat,
      }));
    },
    refetchInterval: 30000, // Refetch setiap 30 detik
  });
}

