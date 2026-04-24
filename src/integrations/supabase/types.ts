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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animal_reports: {
        Row: {
          apparent_condition: string | null
          behavior_tags: string[]
          city: string | null
          color_description: string | null
          created_at: string
          created_by: string | null
          description: string
          duplicate_group_id: string | null
          gps_accuracy: number | null
          id: string
          image_metadata: Json
          is_shadow_hidden: boolean
          latitude: number
          location_text: string | null
          longitude: number
          main_image_url: string
          occurrence_at: string
          reported_at: string
          resolved_at: string | null
          resolved_by: string | null
          risk_tags: string[]
          size_category: string | null
          species: Database["public"]["Enums"]["species_type"]
          state: string | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          trust_weight_score: number
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          validation_status: Database["public"]["Enums"]["validation_status"]
          visibility_score: number
        }
        Insert: {
          apparent_condition?: string | null
          behavior_tags?: string[]
          city?: string | null
          color_description?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          duplicate_group_id?: string | null
          gps_accuracy?: number | null
          id?: string
          image_metadata?: Json
          is_shadow_hidden?: boolean
          latitude: number
          location_text?: string | null
          longitude: number
          main_image_url: string
          occurrence_at?: string
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          risk_tags?: string[]
          size_category?: string | null
          species: Database["public"]["Enums"]["species_type"]
          state?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          trust_weight_score?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          validation_status?: Database["public"]["Enums"]["validation_status"]
          visibility_score?: number
        }
        Update: {
          apparent_condition?: string | null
          behavior_tags?: string[]
          city?: string | null
          color_description?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          duplicate_group_id?: string | null
          gps_accuracy?: number | null
          id?: string
          image_metadata?: Json
          is_shadow_hidden?: boolean
          latitude?: number
          location_text?: string | null
          longitude?: number
          main_image_url?: string
          occurrence_at?: string
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          risk_tags?: string[]
          size_category?: string | null
          species?: Database["public"]["Enums"]["species_type"]
          state?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          trust_weight_score?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          validation_status?: Database["public"]["Enums"]["validation_status"]
          visibility_score?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["user_account_status"]
          avatar_url: string | null
          bio: string | null
          city: string | null
          confirmed_help_count: number
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string | null
          phone: string | null
          received_flags_count: number
          rejected_reports_count: number
          reports_count: number
          trust_level: string
          trust_score: number
          updated_at: string
          validated_reports_count: number
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["user_account_status"]
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          confirmed_help_count?: number
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string | null
          phone?: string | null
          received_flags_count?: number
          rejected_reports_count?: number
          reports_count?: number
          trust_level?: string
          trust_score?: number
          updated_at?: string
          validated_reports_count?: number
        }
        Update: {
          account_status?: Database["public"]["Enums"]["user_account_status"]
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          confirmed_help_count?: number
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          phone?: string | null
          received_flags_count?: number
          rejected_reports_count?: number
          reports_count?: number
          trust_level?: string
          trust_score?: number
          updated_at?: string
          validated_reports_count?: number
        }
        Relationships: []
      }
      report_images: {
        Row: {
          ai_check_status: string
          created_at: string
          hash_signature: string | null
          id: string
          image_type: string
          image_url: string
          metadata: Json
          report_id: string
          uploaded_by: string | null
        }
        Insert: {
          ai_check_status?: string
          created_at?: string
          hash_signature?: string | null
          id?: string
          image_type?: string
          image_url: string
          metadata?: Json
          report_id: string
          uploaded_by?: string | null
        }
        Update: {
          ai_check_status?: string
          created_at?: string
          hash_signature?: string | null
          id?: string
          image_type?: string
          image_url?: string
          metadata?: Json
          report_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_images_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "animal_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_validations: {
        Row: {
          action_type: Database["public"]["Enums"]["validation_action"]
          created_at: string
          id: string
          note: string | null
          report_id: string
          user_id: string
          validation_weight: number
        }
        Insert: {
          action_type: Database["public"]["Enums"]["validation_action"]
          created_at?: string
          id?: string
          note?: string | null
          report_id: string
          user_id: string
          validation_weight?: number
        }
        Update: {
          action_type?: Database["public"]["Enums"]["validation_action"]
          created_at?: string
          id?: string
          note?: string | null
          report_id?: string
          user_id?: string
          validation_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_validations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "animal_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_versions: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          title: string
          version_code: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          version_code: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          version_code?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_terms_acceptance: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          terms_version_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          terms_version_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          terms_version_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_terms_acceptance_terms_version_id_fkey"
            columns: ["terms_version_id"]
            isOneToOne: false
            referencedRelation: "terms_versions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recompute_report_validation: {
        Args: { _report_id: string }
        Returns: undefined
      }
      recompute_user_trust: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "user" | "trusted_user" | "moderator" | "admin"
      report_status:
        | "active"
        | "under_review"
        | "resolved"
        | "archived"
        | "hidden"
      species_type: "dog" | "cat"
      urgency_level: "low" | "medium" | "high" | "critical"
      user_account_status:
        | "active"
        | "restricted"
        | "suspended"
        | "shadow_banned"
      validation_action:
        | "confirm_seen"
        | "deny_not_there"
        | "confirm_info"
        | "possible_fake"
        | "already_helped"
        | "animal_removed"
      validation_status:
        | "unverified"
        | "in_validation"
        | "confirmed"
        | "inconsistent"
        | "possible_fake"
        | "hidden_for_review"
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
      app_role: ["user", "trusted_user", "moderator", "admin"],
      report_status: [
        "active",
        "under_review",
        "resolved",
        "archived",
        "hidden",
      ],
      species_type: ["dog", "cat"],
      urgency_level: ["low", "medium", "high", "critical"],
      user_account_status: [
        "active",
        "restricted",
        "suspended",
        "shadow_banned",
      ],
      validation_action: [
        "confirm_seen",
        "deny_not_there",
        "confirm_info",
        "possible_fake",
        "already_helped",
        "animal_removed",
      ],
      validation_status: [
        "unverified",
        "in_validation",
        "confirmed",
        "inconsistent",
        "possible_fake",
        "hidden_for_review",
      ],
    },
  },
} as const
