import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Pengajuan = Tables<"pengajuan">;
type PengajuanInsert = TablesInsert<"pengajuan">;
type PengajuanUpdate = TablesUpdate<"pengajuan">;

export function usePengajuan() {
  return useQuery({
    queryKey: ["pengajuan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pengajuan")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data as Pengajuan[];
    },
  });
}

export function useCreatePengajuan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pengajuan: PengajuanInsert) => {
      const { data, error } = await supabase
        .from("pengajuan")
        .insert(pengajuan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengajuan"] });
    },
  });
}

export function useUpdatePengajuan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PengajuanUpdate }) => {
      const { data, error } = await supabase
        .from("pengajuan")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengajuan"] });
    },
  });
}
