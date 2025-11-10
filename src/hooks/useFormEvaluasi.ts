import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type FormEvaluasi = Tables<"form_evaluasi">;
type FormApproval = Tables<"form_approval">;
type FormEvaluasiInsert = TablesInsert<"form_evaluasi">;
type FormEvaluasiUpdate = TablesUpdate<"form_evaluasi">;
type FormApprovalInsert = TablesInsert<"form_approval">;

export function useFormEvaluasi() {
  return useQuery({
    queryKey: ["form_evaluasi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_evaluasi")
        .select(`
          *,
          approval:form_approval (
            sekper_date,
            sevp_operation_date,
            keuangan_date,
            sevp_support_date,
            direktur_date
          ),
          pengajuan:pengajuan_id (
            id,
            no_surat,
            judul,
            unit,
            jenis,
            nilai_pengajuan,
            tgl_surat,
            lampiran_url,
            status,
            timestamp
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (FormEvaluasi & { pengajuan: Tables<"pengajuan"> | null; approval: FormApproval | null })[];
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

export function useUpsertFormApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formEvaluasiId,
      updates,
    }: {
      formEvaluasiId: string;
      updates: Partial<FormApprovalInsert>;
    }) => {
      const payload = {
        form_evaluasi_id: formEvaluasiId,
        ...updates,
      };

      const { data, error } = await supabase
        .from("form_approval")
        .upsert(payload, { onConflict: "form_evaluasi_id" })
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
