export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          barber_id: string | null
          barbershop_id: string | null
          client_id: string | null
          created_at: string | null
          end_time: string
          id: string
          price: number | null
          service_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          barber_id?: string | null
          barbershop_id?: string | null
          client_id?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          price?: number | null
          service_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          barber_id?: string | null
          barbershop_id?: string | null
          client_id?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          price?: number | null
          service_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          barbershop_id: string | null
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          barbershop_id?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          barbershop_id?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barbers_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      barbershop_subscriptions: {
        Row: {
          barbershop_id: string | null
          created_at: string | null
          end_date: string
          id: string
          plan_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          barbershop_id?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          barbershop_id?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barbershop_subscriptions_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barbershop_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      barbershops: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          image_url: string | null
          last_payment_date: string | null
          name: string
          next_payment_date: string | null
          owner_id: string | null
          payment_status: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          last_payment_date?: string | null
          name: string
          next_payment_date?: string | null
          owner_id?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          last_payment_date?: string | null
          name?: string
          next_payment_date?: string | null
          owner_id?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          barbershop_id: string | null
          created_at: string | null
          id: string
          invoice_url: string | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          barbershop_id?: string | null
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          barbershop_id?: string | null
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "barbershop_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_superuser: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_activity: {
        Args: {
          action: string
          target_type: string
          target_id: string
          metadata?: Json
        }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
