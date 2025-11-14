import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TahapPengadaanRow = Tables<"tahap_pengadaan">;
export type TemplateTahapanRow = Tables<"template_tahapan">;

export function useTahapPengadaan(pengadaanId?: string, enabled = true) {
  return useQuery<TahapPengadaanRow[]>({
    queryKey: ["tahap_pengadaan", pengadaanId],
    enabled: enabled && Boolean(pengadaanId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tahap_pengadaan")
        .select("id, pengadaan_id, nama_tahap, urutan, tanggal_tahap, nilai_fix, catatan")
        .eq("pengadaan_id", pengadaanId)
        .order("urutan", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTemplateTahapan(metodeId?: string, enabled = true) {
  return useQuery<TemplateTahapanRow[]>({
    queryKey: ["template_tahapan", metodeId],
    enabled: enabled && Boolean(metodeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_tahapan")
        .select("id, metode_id, urutan, nama_tahap, deskripsi")
        .eq("metode_id", metodeId)
        .order("urutan", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

type SaveTahapPayload = {
  pengadaanId: string;
  tahapan: Array<{
    nama_tahap: string;
    urutan: number;
    tanggal_tahap?: string | null;
    catatan?: string | null;
  }>;
};

export function useSaveTahapPengadaan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pengadaanId, tahapan }: SaveTahapPayload) => {
      // reset dulu supaya tahapan lama tidak tersisa ketika template berubah
      const { error: deleteError } = await supabase
        .from("tahap_pengadaan")
        .delete()
        .eq("pengadaan_id", pengadaanId);

      if (deleteError) throw deleteError;

      if (tahapan.length === 0) {
        return [];
      }

      const payload = tahapan.map((item) => ({
        pengadaan_id: pengadaanId,
        nama_tahap: item.nama_tahap,
        urutan: item.urutan,
        tanggal_tahap: item.tanggal_tahap ?? null,
        catatan: item.catatan ?? null,
      }));

      const { data, error } = await supabase
        .from("tahap_pengadaan")
        .insert(payload)
        .select();

      if (error) throw error;
      return data ?? [];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tahap_pengadaan", variables.pengadaanId] });
      queryClient.invalidateQueries({ queryKey: ["pengadaan"] });
    },
  });
}
