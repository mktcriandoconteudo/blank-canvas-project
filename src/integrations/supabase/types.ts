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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_usernames: {
        Row: {
          id: string
          user_id: string
          username: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string | null
          id: string
          reason: string | null
          resort_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string | null
          id?: string
          reason?: string | null
          resort_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          resort_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_resort_id_fkey"
            columns: ["resort_id"]
            isOneToOne: false
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          storage_path: string | null
          subtitle: string
          title: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          storage_path?: string | null
          subtitle?: string
          title?: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          storage_path?: string | null
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_popular: boolean | null
          name: string
          price_per_night: number
          resort_id: string
          sessions: string
          total_nights: number
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_popular?: boolean | null
          name: string
          price_per_night: number
          resort_id: string
          sessions: string
          total_nights?: number
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price_per_night?: number
          resort_id?: string
          sessions?: string
          total_nights?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_plans_resort_id_fkey"
            columns: ["resort_id"]
            isOneToOne: false
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          check_in: string
          check_out: string
          created_at: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number
          id: string
          mp_payment_id: string | null
          mp_preference_id: string | null
          payment_status: string
          plan_name: string
          plan_sessions: string
          price_per_night: number
          resort_id: string
          total_nights: number
          total_price: number
          updated_at: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          payment_status?: string
          plan_name: string
          plan_sessions: string
          price_per_night: number
          resort_id: string
          total_nights: number
          total_price: number
          updated_at?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          payment_status?: string
          plan_name?: string
          plan_sessions?: string
          price_per_night?: number
          resort_id?: string
          total_nights?: number
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_resort_id_fkey"
            columns: ["resort_id"]
            isOneToOne: false
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      resort_payment_config: {
        Row: {
          created_at: string | null
          id: string
          mp_access_token: string | null
          mp_public_key: string | null
          payment_method: string
          pix_bank: string | null
          pix_key: string | null
          pix_name: string | null
          resort_id: string
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mp_access_token?: string | null
          mp_public_key?: string | null
          payment_method?: string
          pix_bank?: string | null
          pix_key?: string | null
          pix_name?: string | null
          resort_id: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mp_access_token?: string | null
          mp_public_key?: string | null
          payment_method?: string
          pix_bank?: string | null
          pix_key?: string | null
          pix_name?: string | null
          resort_id?: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resort_payment_config_resort_id_fkey"
            columns: ["resort_id"]
            isOneToOne: true
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      resort_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_cover: boolean | null
          resort_id: string
          storage_path: string
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_cover?: boolean | null
          resort_id: string
          storage_path: string
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_cover?: boolean | null
          resort_id?: string
          storage_path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resort_photos_resort_id_fkey"
            columns: ["resort_id"]
            isOneToOne: false
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      resorts: {
        Row: {
          amenities: string[] | null
          beds: number | null
          condo_features: string[] | null
          created_at: string | null
          description: string | null
          id: string
          important_info: string[] | null
          is_active: boolean | null
          location: string
          max_guests: number | null
          name: string
          owner_id: string | null
          parent_id: string | null
          price_per_night: number | null
          rating: number | null
          reviews_count: number | null
          tag: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          beds?: number | null
          condo_features?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          important_info?: string[] | null
          is_active?: boolean | null
          location?: string
          max_guests?: number | null
          name: string
          owner_id?: string | null
          parent_id?: string | null
          price_per_night?: number | null
          rating?: number | null
          reviews_count?: number | null
          tag?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          beds?: number | null
          condo_features?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          important_info?: string[] | null
          is_active?: boolean | null
          location?: string
          max_guests?: number | null
          name?: string
          owner_id?: string | null
          parent_id?: string | null
          price_per_night?: number | null
          rating?: number | null
          reviews_count?: number | null
          tag?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resorts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      selector_options: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          icon_name: string
          id: string
          key: string
          label: string
          resort_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          icon_name?: string
          id?: string
          key: string
          label: string
          resort_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          icon_name?: string
          id?: string
          key?: string
          label?: string
          resort_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "selector_options_resort_id_fkey"
            columns: ["resort_id"]
            isOneToOne: false
            referencedRelation: "resorts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
    }
    Enums: {
      app_role: "admin" | "user" | "owner"
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
      app_role: ["admin", "user", "owner"],
    },
  },
} as const
