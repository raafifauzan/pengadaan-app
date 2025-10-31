export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      form_evaluasi: {
        Row: {
          anggaran_hps: number | null
          created_at: string | null
          evaluator_id: string | null
          id: string
          is_final: boolean | null
          kode_form: string
          nama_anggaran: string | null
          pengajuan_id: string
          reg_anggaran: string | null
        }
        Insert: {
          anggaran_hps?: number | null
          created_at?: string | null
          evaluator_id?: string | null
          id?: string
          is_final?: boolean | null
          kode_form: string
          nama_anggaran?: string | null
          pengajuan_id: string
          reg_anggaran?: string | null
        }
        Update: {
          anggaran_hps?: number | null
          created_at?: string | null
          evaluator_id?: string | null
          id?: string
          is_final?: boolean | null
          kode_form?: string
          nama_anggaran?: string | null
          pengajuan_id?: string
          reg_anggaran?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_evaluasi_pengajuan_id_fkey"
            columns: ["pengajuan_id"]
            isOneToOne: false
            referencedRelation: "pengajuan"
            referencedColumns: ["id"]
          },
        ]
      }
      LACC: {
        Row: {
          faktur_pajak: string | null
          jenis_project: string | null
          kelompok_klien: string | null
          klien: string | null
          kode_pd: string | null
          nama_project: string | null
          nilai_project: number | null
          no: number
          pic_wilayah: string | null
          status_approach: string | null
          status_invoice: string | null
          tgl_pengakuan_revenue: string | null
        }
        Insert: {
          faktur_pajak?: string | null
          jenis_project?: string | null
          kelompok_klien?: string | null
          klien?: string | null
          kode_pd?: string | null
          nama_project?: string | null
          nilai_project?: number | null
          no?: number
          pic_wilayah?: string | null
          status_approach?: string | null
          status_invoice?: string | null
          tgl_pengakuan_revenue?: string | null
        }
        Update: {
          faktur_pajak?: string | null
          jenis_project?: string | null
          kelompok_klien?: string | null
          klien?: string | null
          kode_pd?: string | null
          nama_project?: string | null
          nilai_project?: number | null
          no?: number
          pic_wilayah?: string | null
          status_approach?: string | null
          status_invoice?: string | null
          tgl_pengakuan_revenue?: string | null
        }
        Relationships: []
      }
      Pengadaan: {
        Row: {
          "BAGIAN / UNIT": string | null
          HPS: number | null
          "JENIS PENGADAAN": string | null
          "KESESUAIAN WAKTU DAN SPESIFIKASI BARANG": string | null
          KETERANGAN: string | null
          "KLASIFIKASI PENGADAAN": string | null
          "METODE PENGADAAN": string | null
          "NAMA ANGGARAN": string | null
          "NEGOSIASI (%)": number | null
          "NO PROYEK": string
          "NOMOR PENGAJUAN / FROM EVALUASI": string | null
          "NOMOR SPK/OPL": string | null
          PENAWARAN: number | null
          PROYEK: string | null
          REALISASI: number | null
          "REG. ANGGARAN": string | null
          STATUS: string | null
          "TANGGAL BAST": string | null
          "TANGGAL MULAI": string | null
          "TANGGAL PENGADAAN": string | null
          "TANGGAL SELESAI": string | null
          VENDOR: string | null
        }
        Insert: {
          "BAGIAN / UNIT"?: string | null
          HPS?: number | null
          "JENIS PENGADAAN"?: string | null
          "KESESUAIAN WAKTU DAN SPESIFIKASI BARANG"?: string | null
          KETERANGAN?: string | null
          "KLASIFIKASI PENGADAAN"?: string | null
          "METODE PENGADAAN"?: string | null
          "NAMA ANGGARAN"?: string | null
          "NEGOSIASI (%)"?: number | null
          "NO PROYEK": string
          "NOMOR PENGAJUAN / FROM EVALUASI"?: string | null
          "NOMOR SPK/OPL"?: string | null
          PENAWARAN?: number | null
          PROYEK?: string | null
          REALISASI?: number | null
          "REG. ANGGARAN"?: string | null
          STATUS?: string | null
          "TANGGAL BAST"?: string | null
          "TANGGAL MULAI"?: string | null
          "TANGGAL PENGADAAN"?: string | null
          "TANGGAL SELESAI"?: string | null
          VENDOR?: string | null
        }
        Update: {
          "BAGIAN / UNIT"?: string | null
          HPS?: number | null
          "JENIS PENGADAAN"?: string | null
          "KESESUAIAN WAKTU DAN SPESIFIKASI BARANG"?: string | null
          KETERANGAN?: string | null
          "KLASIFIKASI PENGADAAN"?: string | null
          "METODE PENGADAAN"?: string | null
          "NAMA ANGGARAN"?: string | null
          "NEGOSIASI (%)"?: number | null
          "NO PROYEK"?: string
          "NOMOR PENGAJUAN / FROM EVALUASI"?: string | null
          "NOMOR SPK/OPL"?: string | null
          PENAWARAN?: number | null
          PROYEK?: string | null
          REALISASI?: number | null
          "REG. ANGGARAN"?: string | null
          STATUS?: string | null
          "TANGGAL BAST"?: string | null
          "TANGGAL MULAI"?: string | null
          "TANGGAL PENGADAAN"?: string | null
          "TANGGAL SELESAI"?: string | null
          VENDOR?: string | null
        }
        Relationships: []
      }
      pengajuan: {
        Row: {
          catatan: string | null
          email: string | null
          id: string
          jenis: string | null
          judul: string | null
          lampiran_url: string | null
          nilai_pengajuan: number
          no_surat: string | null
          qc_at: string | null
          qc_by: string | null
          status: string | null
          tgl_surat: string | null
          timestamp: string
          unit: string | null
        }
        Insert: {
          catatan?: string | null
          email?: string | null
          id?: string
          jenis?: string | null
          judul?: string | null
          lampiran_url?: string | null
          nilai_pengajuan: number
          no_surat?: string | null
          qc_at?: string | null
          qc_by?: string | null
          status?: string | null
          tgl_surat?: string | null
          timestamp?: string
          unit?: string | null
        }
        Update: {
          catatan?: string | null
          email?: string | null
          id?: string
          jenis?: string | null
          judul?: string | null
          lampiran_url?: string | null
          nilai_pengajuan?: number
          no_surat?: string | null
          qc_at?: string | null
          qc_by?: string | null
          status?: string | null
          tgl_surat?: string | null
          timestamp?: string
          unit?: string | null
        }
        Relationships: []
      }
      "Project LACC": {
        Row: {
          jenis_project: string | null
          kelompok_klien: string | null
          kode_pd: string
          nama_project: string | null
          nilai_project: number | null
          pic_wilayah: string | null
          status_approach: string | null
          tgl_pengakuan_revenue: string | null
        }
        Insert: {
          jenis_project?: string | null
          kelompok_klien?: string | null
          kode_pd: string
          nama_project?: string | null
          nilai_project?: number | null
          pic_wilayah?: string | null
          status_approach?: string | null
          tgl_pengakuan_revenue?: string | null
        }
        Update: {
          jenis_project?: string | null
          kelompok_klien?: string | null
          kode_pd?: string
          nama_project?: string | null
          nilai_project?: number | null
          pic_wilayah?: string | null
          status_approach?: string | null
          tgl_pengakuan_revenue?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
