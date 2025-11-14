import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

// Row asli tabel pengadaan
export type Pengadaan = Tables<"pengadaan">;
export type PengadaanInsert = TablesInsert<"pengadaan">;
export type PengadaanUpdate = TablesUpdate<"pengadaan">;

// Bentuk data yang dipakai di UI (sudah include hasil join)
export type PengadaanWithRelations = Pengadaan & {
  metode_nama?: string | null;
  form_evaluasi_kode?: string | null;
  form_evaluasi_anggaran_hps?: number | null;
  form_evaluasi_created_at?: string | null;
  pengajuan_judul?: string | null;
  pengajuan_tanggal?: string | null;      // tgl_surat atau fallback timestamp
  pengajuan_lampiran_url?: string | null;
  pengajuan_jenis?: string | null;
  pengajuan_nilai_pengajuan?: number | null;
  pengajuan_unit?: string | null;
  pengajuan_no_surat?: string | null;
};

export function usePengadaan() {
  return useQuery<PengadaanWithRelations[]>({
    queryKey: ["pengadaan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pengadaan")
        .select(
          `
          id,
          kode_form,
          form_evaluasi_id,
          metode_id,
          status_pengadaan,
          created_at,
          created_by,
          metode_pengadaan (
            id,
            kode,
            nama_metode
          ),
          form_evaluasi (
            id,
            kode_form,
            anggaran_hps,
            created_at,
            pengajuan (
              id,
              tgl_surat,
              timestamp,
              judul,
              lampiran_url,
              jenis,
              nilai_pengajuan,
              unit,
              no_surat
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row: any) => {
        // pengajuan bisa berupa object atau array → normalisasi
        const pengajuanRaw = row.form_evaluasi?.pengajuan;
        const pengajuan = Array.isArray(pengajuanRaw)
          ? pengajuanRaw[0]
          : pengajuanRaw;

        const tanggal =
          pengajuan?.tgl_surat ??
          pengajuan?.timestamp ??
          null;

        return {
          ...row,
          metode_nama: row.metode_pengadaan?.nama_metode ?? null,
          form_evaluasi_kode: row.form_evaluasi?.kode_form ?? null,
          form_evaluasi_anggaran_hps: row.form_evaluasi?.anggaran_hps ?? null,
          form_evaluasi_created_at: row.form_evaluasi?.created_at ?? null,
          pengajuan_judul: pengajuan?.judul ?? null,
          pengajuan_tanggal: tanggal,
          pengajuan_lampiran_url: pengajuan?.lampiran_url ?? null,
          pengajuan_jenis: pengajuan?.jenis ?? null,
          pengajuan_nilai_pengajuan: pengajuan?.nilai_pengajuan ?? null,
          pengajuan_unit: pengajuan?.unit ?? null,
          pengajuan_no_surat: pengajuan?.no_surat ?? null,
        } as PengadaanWithRelations;
      });
    },
  });
}

export function useCreatePengadaan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PengadaanInsert) => {
      const { data, error } = await supabase
        .from("pengadaan")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as Pengadaan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengadaan"] });
    },
  });
}

export function useUpdatePengadaan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: PengadaanUpdate;
    }) => {
      const { data, error } = await supabase
        .from("pengadaan")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Pengadaan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengadaan"] });
    },
  });
}
