import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type FormEvaluasi = Tables<"form_evaluasi">;
type FormEvaluasiInsert = TablesInsert<"form_evaluasi">;
type FormEvaluasiUpdate = TablesUpdate<"form_evaluasi">;

export function useFormEvaluasi() {
  return useQuery({
    queryKey: ["form_evaluasi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_evaluasi")
        .select(`
          *,
          pengajuan:pengajuan_id (
            id,
            no_surat,
            judul,
            unit,
            jenis,
            nilai_pengajuan,
            tgl_surat,
            status,
            timestamp
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (FormEvaluasi & { pengajuan: Tables<"pengajuan"> })[];
    },
  });
}

export function useCreateFormEvaluasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formEvaluasi: FormEvaluasiInsert) => {
      const { data, error } = await supabase
        .from("form_evaluasi")
        .insert(formEvaluasi)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form_evaluasi"] });
    },
  });
}

export function useUpdateFormEvaluasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FormEvaluasiUpdate }) => {
      const { data, error } = await supabase
        .from("form_evaluasi")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form_evaluasi"] });
    },
  });
}
