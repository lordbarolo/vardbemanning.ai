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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      api_rate_limit: {
        Row: {
          bucket_key: string
          hits: number
          window_start: string
        }
        Insert: {
          bucket_key: string
          hits?: number
          window_start: string
        }
        Update: {
          bucket_key?: string
          hits?: number
          window_start?: string
        }
        Relationships: []
      }
      compensation_assumptions: {
        Row: {
          agency_margin: number
          category: string
          created_at: string
          employer_social_fee: number | null
          employment_form: string
          margin_high: number
          margin_low: number
          occupational_pension: number | null
          source: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          agency_margin: number
          category: string
          created_at?: string
          employer_social_fee?: number | null
          employment_form: string
          margin_high: number
          margin_low: number
          occupational_pension?: number | null
          source: string
          valid_from: string
          valid_to: string
        }
        Update: {
          agency_margin?: number
          category?: string
          created_at?: string
          employer_social_fee?: number | null
          employment_form?: string
          margin_high?: number
          margin_low?: number
          occupational_pension?: number | null
          source?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      counties: {
        Row: {
          county_code: string
          name: string
        }
        Insert: {
          county_code: string
          name: string
        }
        Update: {
          county_code?: string
          name?: string
        }
        Relationships: []
      }
      lookup_log: {
        Row: {
          candidate_count: number | null
          id: number
          municipality_code: string | null
          municipality_match: string | null
          outcome: string
          role_code: string | null
          role_match: string | null
          surface: string
          ts: string
          zone: number | null
        }
        Insert: {
          candidate_count?: number | null
          id?: never
          municipality_code?: string | null
          municipality_match?: string | null
          outcome: string
          role_code?: string | null
          role_match?: string | null
          surface: string
          ts?: string
          zone?: number | null
        }
        Update: {
          candidate_count?: number | null
          id?: never
          municipality_code?: string | null
          municipality_match?: string | null
          outcome?: string
          role_code?: string | null
          role_match?: string | null
          surface?: string
          ts?: string
          zone?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_log_municipality_code_fkey"
            columns: ["municipality_code"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["municipality_code"]
          },
          {
            foreignKeyName: "lookup_log_municipality_code_fkey"
            columns: ["municipality_code"]
            isOneToOne: false
            referencedRelation: "role_municipality_prices"
            referencedColumns: ["municipality_code"]
          },
          {
            foreignKeyName: "lookup_log_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_municipality_prices"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "lookup_log_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_zone_compensation"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "lookup_log_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_code"]
          },
        ]
      }
      municipalities: {
        Row: {
          contract_region: string
          county_code: string
          created_at: string
          municipality_code: string
          name: string
          zone: number
        }
        Insert: {
          contract_region: string
          county_code: string
          created_at?: string
          municipality_code: string
          name: string
          zone: number
        }
        Update: {
          contract_region?: string
          county_code?: string
          created_at?: string
          municipality_code?: string
          name?: string
          zone?: number
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_county_code_fkey"
            columns: ["county_code"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["county_code"]
          },
          {
            foreignKeyName: "municipalities_zone_fkey"
            columns: ["zone"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["zone"]
          },
        ]
      }
      role_aliases: {
        Row: {
          alias: string
          created_at: string
          is_primary: boolean
          role_code: string
          source: string
        }
        Insert: {
          alias: string
          created_at?: string
          is_primary?: boolean
          role_code: string
          source: string
        }
        Update: {
          alias?: string
          created_at?: string
          is_primary?: boolean
          role_code?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_aliases_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_municipality_prices"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "role_aliases_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_zone_compensation"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "role_aliases_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_code"]
          },
        ]
      }
      role_zone_prices: {
        Row: {
          article_number: string
          catalog_version: string
          currency: string
          hourly_price: number
          role_code: string
          source_document: string
          valid_from: string
          valid_to: string
          zone: number
        }
        Insert: {
          article_number: string
          catalog_version: string
          currency?: string
          hourly_price: number
          role_code: string
          source_document: string
          valid_from: string
          valid_to: string
          zone: number
        }
        Update: {
          article_number?: string
          catalog_version?: string
          currency?: string
          hourly_price?: number
          role_code?: string
          source_document?: string
          valid_from?: string
          valid_to?: string
          zone?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_zone_prices_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_municipality_prices"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "role_zone_prices_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_zone_compensation"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "role_zone_prices_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "role_zone_prices_zone_fkey"
            columns: ["zone"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["zone"]
          },
        ]
      }
      roles: {
        Row: {
          category: string
          created_at: string
          description: string | null
          name: string
          procurement_area: string
          role_code: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          name: string
          procurement_area: string
          role_code: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          name?: string
          procurement_area?: string
          role_code?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          description: string
          label: string
          zone: number
        }
        Insert: {
          description: string
          label: string
          zone: number
        }
        Update: {
          description?: string
          label?: string
          zone?: number
        }
        Relationships: []
      }
    }
    Views: {
      lookup_stats_daily: {
        Row: {
          day: string | null
          lookups: number | null
          outcome: string | null
          role_code: string | null
          surface: string | null
          zone: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_log_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_municipality_prices"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "lookup_log_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "role_zone_compensation"
            referencedColumns: ["role_code"]
          },
          {
            foreignKeyName: "lookup_log_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_code"]
          },
        ]
      }
      role_municipality_prices: {
        Row: {
          article_number: string | null
          catalog_version: string | null
          category: string | null
          contract_region: string | null
          county_code: string | null
          county_name: string | null
          currency: string | null
          hourly_price: number | null
          municipality_code: string | null
          municipality_name: string | null
          role_code: string | null
          role_description: string | null
          role_name: string | null
          valid_from: string | null
          valid_to: string | null
          zone: number | null
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_county_code_fkey"
            columns: ["county_code"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["county_code"]
          },
          {
            foreignKeyName: "municipalities_zone_fkey"
            columns: ["zone"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["zone"]
          },
        ]
      }
      role_zone_compensation: {
        Row: {
          anstalld_gross_hourly: number | null
          anstalld_high: number | null
          anstalld_low: number | null
          anstalld_margin: number | null
          article_number: string | null
          category: string | null
          currency: string | null
          display_name: string | null
          employer_social_fee: number | null
          foretagare_high: number | null
          foretagare_hourly: number | null
          foretagare_low: number | null
          foretagare_margin: number | null
          margin_high: number | null
          margin_low: number | null
          occupational_pension: number | null
          region_price: number | null
          role_code: string | null
          role_name: string | null
          valid_from: string | null
          valid_to: string | null
          zone: number | null
        }
        Relationships: [
          {
            foreignKeyName: "role_zone_prices_zone_fkey"
            columns: ["zone"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["zone"]
          },
        ]
      }
    }
    Functions: {
      api_rate_limit_hit: {
        Args: {
          p_bucket_key: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: {
          allowed: boolean
          hits: number
          retry_after_seconds: number
        }[]
      }
      hero_compensation: {
        Args: {
          municipality_query: string
          on_date?: string
          role_query: string
        }
        Returns: {
          anstalld_gross_hourly: number
          anstalld_high: number
          anstalld_low: number
          anstalld_margin: number
          article_number: string
          catalog_version: string
          category: string
          contract_region: string
          county_name: string
          currency: string
          display_name: string
          employer_social_fee: number
          foretagare_high: number
          foretagare_hourly: number
          foretagare_low: number
          foretagare_margin: number
          margin_high: number
          margin_low: number
          municipality_code: string
          municipality_match: string
          municipality_name: string
          occupational_pension: number
          region_price: number
          role_code: string
          role_match: string
          role_name: string
          valid_from: string
          valid_to: string
          zone: number
        }[]
      }
      hero_compensation_v1_legacy: {
        Args: {
          municipality_query: string
          on_date?: string
          role_query: string
        }
        Returns: {
          anstalld_gross_hourly: number
          anstalld_margin: number
          article_number: string
          category: string
          contract_region: string
          county_name: string
          currency: string
          employer_social_fee: number
          foretagare_hourly: number
          foretagare_margin: number
          municipality_code: string
          municipality_match: string
          municipality_name: string
          occupational_pension: number
          region_price: number
          role_code: string
          role_match: string
          role_name: string
          valid_from: string
          valid_to: string
          zone: number
        }[]
      }
      log_lookup: {
        Args: {
          p_candidate_count?: number
          p_municipality_code?: string
          p_municipality_match?: string
          p_outcome: string
          p_role_code?: string
          p_role_match?: string
          p_surface: string
          p_zone?: number
        }
        Returns: undefined
      }
      price_lookup: {
        Args: {
          municipality_query: string
          on_date?: string
          role_query: string
        }
        Returns: {
          article_number: string
          currency: string
          hourly_price: number
          municipality_code: string
          municipality_match: string
          municipality_name: string
          role_code: string
          role_match: string
          role_name: string
          valid_from: string
          valid_to: string
          zone: number
        }[]
      }
      resolve_municipalities: {
        Args: { max_rows?: number; q: string }
        Returns: {
          contract_region: string
          match_kind: string
          municipality_code: string
          name: string
          similarity: number
          zone: number
        }[]
      }
      resolve_roles: {
        Args: { max_rows?: number; q: string }
        Returns: {
          category: string
          match_kind: string
          name: string
          role_code: string
          similarity: number
        }[]
      }
      search_municipalities: {
        Args: { max_rows?: number; q: string }
        Returns: {
          contract_region: string
          municipality_code: string
          name: string
          similarity: number
          zone: number
        }[]
      }
      search_roles: {
        Args: { max_rows?: number; q: string }
        Returns: {
          category: string
          display_name: string
          name: string
          role_code: string
          similarity: number
        }[]
      }
      search_roles_v1_legacy: {
        Args: { max_rows?: number; q: string }
        Returns: {
          category: string
          name: string
          role_code: string
          similarity: number
        }[]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
