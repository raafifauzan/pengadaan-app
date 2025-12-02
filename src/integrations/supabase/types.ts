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
      approval_history: {
        Row: {
          action: string
          approver_id: string
          approver_role: Database["public"]["Enums"]["app_role"]
          catatan: string | null
          created_at: string | null
          id: string
          pengajuan_id: string
        }
        Insert: {
          action: string
          approver_id: string
          approver_role: Database["public"]["Enums"]["app_role"]
          catatan?: string | null
          created_at?: string | null
          id?: string
          pengajuan_id: string
        }
        Update: {
          action?: string
          approver_id?: string
          approver_role?: Database["public"]["Enums"]["app_role"]
          catatan?: string | null
          created_at?: string | null
          id?: string
          pengajuan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_pengajuan_id_fkey"
            columns: ["pengajuan_id"]
            isOneToOne: false
            referencedRelation: "pengajuan"
            referencedColumns: ["id"]
          },
        ]
      }
      form_approval: {
        Row: {
          direktur_date: string | null
          form_evaluasi_id: string
          keuangan_date: string | null
          sekper_date: string | null
          sevp_operation_date: string | null
          sevp_support_date: string | null
        }
        Insert: {
          direktur_date?: string | null
          form_evaluasi_id: string
          keuangan_date?: string | null
          sekper_date?: string | null
          sevp_operation_date?: string | null
          sevp_support_date?: string | null
        }
        Update: {
          direktur_date?: string | null
          form_evaluasi_id?: string
          keuangan_date?: string | null
          sekper_date?: string | null
          sevp_operation_date?: string | null
          sevp_support_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_approval_form_evaluasi_id_fkey"
            columns: ["form_evaluasi_id"]
            isOneToOne: true
            referencedRelation: "form_evaluasi"
            referencedColumns: ["id"]
          },
        ]
      }
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
      metode_pengadaan: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          kode: string
          nama_metode: string
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          kode: string
          nama_metode: string
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          kode?: string
          nama_metode?: string
        }
        Relationships: []
      }
      pengadaan: {
        Row: {
          created_at: string | null
          created_by: string | null
          form_evaluasi_id: string
          id: string
          kode_form: string
          metode_id: string
          status_pengadaan: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          form_evaluasi_id: string
          id?: string
          kode_form: string
          metode_id: string
          status_pengadaan?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          form_evaluasi_id?: string
          id?: string
          kode_form?: string
          metode_id?: string
          status_pengadaan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pengadaan_form_evaluasi_id_fkey"
            columns: ["form_evaluasi_id"]
            isOneToOne: false
            referencedRelation: "form_evaluasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengadaan_metode_id_fkey"
            columns: ["metode_id"]
            isOneToOne: false
            referencedRelation: "metode_pengadaan"
            referencedColumns: ["id"]
          },
        ]
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
      tahap_pengadaan: {
        Row: {
          catatan: string | null
          created_at: string | null
          created_by: string | null
          id: string
          nama_tahap: string
          nilai_fix: number | null
          pengadaan_id: string
          tanggal_tahap: string | null
          urutan: number
          vendor_id: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nama_tahap: string
          nilai_fix?: number | null
          pengadaan_id: string
          tanggal_tahap?: string | null
          urutan: number
          vendor_id?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nama_tahap?: string
          nilai_fix?: number | null
          pengadaan_id?: string
          tanggal_tahap?: string | null
          urutan?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tahap_pengadaan_pengadaan_id_fkey"
            columns: ["pengadaan_id"]
            isOneToOne: false
            referencedRelation: "pengadaan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tahap_pengadaan_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor"
            referencedColumns: ["id"]
          },
        ]
      }
      template_tahapan: {
        Row: {
          deskripsi: string | null
          id: string
          metode_id: string
          nama_tahap: string
          urutan: number
        }
        Insert: {
          deskripsi?: string | null
          id?: string
          metode_id: string
          nama_tahap: string
          urutan: number
        }
        Update: {
          deskripsi?: string | null
          id?: string
          metode_id?: string
          nama_tahap?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_tahapan_metode_id_fkey"
            columns: ["metode_id"]
            isOneToOne: false
            referencedRelation: "metode_pengadaan"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          kode_vendor: string
          kontak: string | null
          nama_vendor: string
          status_vendor: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          kode_vendor: string
          kontak?: string | null
          nama_vendor: string
          status_vendor?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          kode_vendor?: string
          kontak?: string | null
          nama_vendor?: string
          status_vendor?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_approval: {
        Args: { _action: string; _catatan?: string; _pengajuan_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "sekretaris_perusahaan"
        | "direktur"
        | "staff"
        | "evaluator"
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
    Enums: {
      app_role: [
        "admin",
        "sekretaris_perusahaan",
        "direktur",
        "staff",
        "evaluator",
      ],
    },
  },
} as const
