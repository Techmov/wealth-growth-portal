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
      features: {
        Row: {
          created_at: string | null
          description: string
          icon_name: string
          id: string
          is_active: boolean
          priority: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon_name: string
          id?: string
          is_active?: boolean
          priority?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          priority?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string | null
          current_value: number
          end_date: string
          final_value: number
          id: string
          last_profit_claim_date: string | null
          product_id: string
          start_date: string | null
          starting_value: number
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          current_value: number
          end_date: string
          final_value: number
          id?: string
          last_profit_claim_date?: string | null
          product_id: string
          start_date?: string | null
          starting_value: number
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_value?: number
          end_date?: string
          final_value?: number
          id?: string
          last_profit_claim_date?: string | null
          product_id?: string
          start_date?: string | null
          starting_value?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_withdrawal_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string | null
          description: string
          discount_percentage: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          priority: number
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          amount: number
          created_at: string | null
          description: string
          duration: number
          growth_rate: number
          id: string
          name: string
          risk: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string | null
          description: string
          duration: number
          growth_rate: number
          id?: string
          name: string
          risk: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string | null
          description?: string
          duration?: number
          growth_rate?: number
          id?: string
          name?: string
          risk?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string | null
          email: string
          escrowed_amount: number | null
          id: string
          name: string
          referral_bonus: number
          referral_code: string
          referred_by: string | null
          role: string
          total_invested: number
          total_referred_investments: number | null
          total_referred_users: number | null
          total_withdrawn: number
          trc20_address: string | null
          username: string
          withdrawal_password: string | null
        }
        Insert: {
          balance?: number
          created_at?: string | null
          email: string
          escrowed_amount?: number | null
          id: string
          name: string
          referral_bonus?: number
          referral_code: string
          referred_by?: string | null
          role?: string
          total_invested?: number
          total_referred_investments?: number | null
          total_referred_users?: number | null
          total_withdrawn?: number
          trc20_address?: string | null
          username: string
          withdrawal_password?: string | null
        }
        Update: {
          balance?: number
          created_at?: string | null
          email?: string
          escrowed_amount?: number | null
          id?: string
          name?: string
          referral_bonus?: number
          referral_code?: string
          referred_by?: string | null
          role?: string
          total_invested?: number
          total_referred_investments?: number | null
          total_referred_users?: number | null
          total_withdrawn?: number
          trc20_address?: string | null
          username?: string
          withdrawal_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "user_withdrawal_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      promotions: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          priority: number
          title: string
          updated_at: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          date: string | null
          deposit_screenshot: string | null
          description: string | null
          id: string
          rejection_reason: string | null
          status: string
          trc20_address: string | null
          tx_hash: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          date?: string | null
          deposit_screenshot?: string | null
          description?: string | null
          id?: string
          rejection_reason?: string | null
          status: string
          trc20_address?: string | null
          tx_hash?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          date?: string | null
          deposit_screenshot?: string | null
          description?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string
          trc20_address?: string | null
          tx_hash?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_withdrawal_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          date: string | null
          fee_amount: number | null
          id: string
          rejection_reason: string | null
          status: string
          trc20_address: string
          tx_hash: string | null
          user_id: string
          withdrawal_source: string | null
        }
        Insert: {
          amount: number
          date?: string | null
          fee_amount?: number | null
          id?: string
          rejection_reason?: string | null
          status: string
          trc20_address: string
          tx_hash?: string | null
          user_id: string
          withdrawal_source?: string | null
        }
        Update: {
          amount?: number
          date?: string | null
          fee_amount?: number | null
          id?: string
          rejection_reason?: string | null
          status?: string
          trc20_address?: string
          tx_hash?: string | null
          user_id?: string
          withdrawal_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_withdrawal_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_withdrawal_stats: {
        Row: {
          available_withdrawal: number | null
          balance: number | null
          escrowed_amount: number | null
          pending_withdrawals: number | null
          profit_amount: number | null
          referral_bonus: number | null
          total_invested: number | null
          total_withdrawn: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          available_withdrawal?: never
          balance?: number | null
          escrowed_amount?: number | null
          pending_withdrawals?: never
          profit_amount?: never
          referral_bonus?: number | null
          total_invested?: number | null
          total_withdrawn?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          available_withdrawal?: never
          balance?: number | null
          escrowed_amount?: number | null
          pending_withdrawals?: never
          profit_amount?: never
          referral_bonus?: number | null
          total_invested?: number | null
          total_withdrawn?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_available_withdrawal: {
        Args: { user_id: string }
        Returns: number
      }
      calculate_claimable_profit: {
        Args: { p_investment_id: string }
        Returns: number
      }
      claim_investment_profit: {
        Args: { p_investment_id: string }
        Returns: Json
      }
      create_investment: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_amount: number
          p_end_date: string
          p_starting_value: number
          p_current_value: number
          p_final_value: number
        }
        Returns: Json
      }
      get_admin_plans: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          amount: number
          created_at: string | null
          description: string
          duration: number
          growth_rate: number
          id: string
          name: string
          risk: string
        }[]
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          balance: number
          created_at: string | null
          email: string
          escrowed_amount: number | null
          id: string
          name: string
          referral_bonus: number
          referral_code: string
          referred_by: string | null
          role: string
          total_invested: number
          total_referred_investments: number | null
          total_referred_users: number | null
          total_withdrawn: number
          trc20_address: string | null
          username: string
          withdrawal_password: string | null
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_pending_deposits: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          date: string | null
          deposit_screenshot: string | null
          description: string | null
          id: string
          rejection_reason: string | null
          status: string
          trc20_address: string | null
          tx_hash: string | null
          type: string
          user_id: string
        }[]
      }
      get_pending_withdrawals: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          amount: number
          status: string
          date: string
          trc20_address: string
          tx_hash: string
          rejection_reason: string
          name: string
          email: string
          username: string
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          name: string
          email: string
          username: string
        }[]
      }
      request_withdrawal: {
        Args:
          | {
              p_user_id: string
              p_amount: number
              p_trc20_address: string
              p_withdrawal_source: string
            }
          | {
              p_user_id: string
              p_amount: number
              p_trc20_address: string
              p_withdrawal_source?: string
              p_fee_amount?: number
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
