import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Pengajuan = Tables<"pengajuan">;

// Interface untuk statistik dashboard
export interface DashboardStats {
  totalPengajuan: number;
  totalDisetujui: number;
  totalPending: number;
  totalBudget: number;
  approvalRate: number;
}

// Interface untuk trend data
export interface TrendData {
  month: string;
  total: number;
  selesai: number;
}

// Interface untuk divisi data
export interface DivisionData {
  divisi: string;
  total: number;
  selesai: number;
  persentase: number;
}

// Hook untuk mendapatkan statistik dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Ambil semua data pengajuan
      const { data: pengajuan, error } = await supabase
        .from("pengajuan")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      const totalPengajuan = pengajuan?.length || 0;
      
      // Hitung statistik berdasarkan status
      const totalDisetujui = pengajuan?.filter(
        (p) => p.status === "approved" || p.status === "disetujui"
      ).length || 0;
      
      const totalPending = pengajuan?.filter(
        (p) => p.status === "pending" || p.status === "menunggu"
      ).length || 0;
      
      // Hitung total budget (jumlah nilai_pengajuan)
      const totalBudget = pengajuan?.reduce(
        (sum, p) => sum + (p.nilai_pengajuan || 0),
        0
      ) || 0;
      
      // Hitung approval rate
      const approvalRate = totalPengajuan > 0 
        ? Math.round((totalDisetujui / totalPengajuan) * 100) 
        : 0;

      return {
        totalPengajuan,
        totalDisetujui,
        totalPending,
        totalBudget,
        approvalRate,
      };
    },
    refetchInterval: 30000, // Refetch setiap 30 detik
  });
}

// Hook untuk mendapatkan trend data (bulanan)
export function useDashboardTrends() {
  return useQuery({
    queryKey: ["dashboard", "trends"],
    queryFn: async (): Promise<TrendData[]> => {
      const { data: pengajuan, error } = await supabase
        .from("pengajuan")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      // Group by bulan dari timestamp
      const monthlyData: Record<string, { total: number; selesai: number }> = {};

      pengajuan?.forEach((p) => {
        if (p.timestamp) {
          const date = new Date(p.timestamp);
          const monthKey = date.toLocaleDateString("id-ID", { month: "short" });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, selesai: 0 };
          }
          
          monthlyData[monthKey].total += 1;
          
          if (p.status === "approved" || p.status === "disetujui" || p.status === "selesai") {
            monthlyData[monthKey].selesai += 1;
          }
        }
      });

      // Convert ke array dan sort
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const trends: TrendData[] = months
        .map((month) => ({
          month,
          total: monthlyData[month]?.total || 0,
          selesai: monthlyData[month]?.selesai || 0,
        }))
        .filter((t) => t.total > 0 || t.selesai > 0); // Hanya tampilkan bulan yang ada datanya

      return trends.length > 0 ? trends : [
        { month: "Jan", total: 0, selesai: 0 },
        { month: "Feb", total: 0, selesai: 0 },
        { month: "Mar", total: 0, selesai: 0 },
      ];
    },
  });
}

// Hook untuk mendapatkan data per divisi
export function useDashboardDivisions() {
  return useQuery({
    queryKey: ["dashboard", "divisions"],
    queryFn: async (): Promise<DivisionData[]> => {
      const { data: pengajuan, error } = await supabase
        .from("pengajuan")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      // Group by unit/divisi
      const divisionData: Record<string, { total: number; selesai: number }> = {};

      pengajuan?.forEach((p) => {
        const divisi = p.unit || "Unknown";
        
        if (!divisionData[divisi]) {
          divisionData[divisi] = { total: 0, selesai: 0 };
        }
        
        divisionData[divisi].total += 1;
        
        if (p.status === "approved" || p.status === "disetujui" || p.status === "selesai") {
          divisionData[divisi].selesai += 1;
        }
      });

      // Convert ke array dan hitung persentase
      const divisions: DivisionData[] = Object.entries(divisionData).map(([divisi, data]) => ({
        divisi,
        total: data.total,
        selesai: data.selesai,
        persentase: data.total > 0 
          ? Math.round((data.selesai / data.total) * 100 * 10) / 10 
          : 0,
      })).sort((a, b) => b.total - a.total); // Sort by total descending

      return divisions;
    },
  });
}

// Hook untuk mendapatkan pengajuan terbaru
export function useLatestPengajuan(limit: number = 5) {
  return useQuery({
    queryKey: ["dashboard", "latest-pengajuan", limit],
    queryFn: async (): Promise<Pengajuan[]> => {
      const { data, error } = await supabase
        .from("pengajuan")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Pengajuan[];
    },
  });
}

