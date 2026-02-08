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
      api_configurations: {
        Row: {
          b2c_result_url: string | null
          b2c_timeout_url: string | null
          c2b_confirmation_url: string | null
          c2b_validation_url: string | null
          consumer_key: string | null
          consumer_secret: string | null
          created_at: string
          environment: Database["public"]["Enums"]["environment_type"]
          id: string
          initiator_name: string | null
          is_active: boolean
          passkey: string | null
          security_credential: string | null
          shortcode: string | null
          updated_at: string
        }
        Insert: {
          b2c_result_url?: string | null
          b2c_timeout_url?: string | null
          c2b_confirmation_url?: string | null
          c2b_validation_url?: string | null
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string
          environment: Database["public"]["Enums"]["environment_type"]
          id?: string
          initiator_name?: string | null
          is_active?: boolean
          passkey?: string | null
          security_credential?: string | null
          shortcode?: string | null
          updated_at?: string
        }
        Update: {
          b2c_result_url?: string | null
          b2c_timeout_url?: string | null
          c2b_confirmation_url?: string | null
          c2b_validation_url?: string | null
          consumer_key?: string | null
          consumer_secret?: string | null
          created_at?: string
          environment?: Database["public"]["Enums"]["environment_type"]
          id?: string
          initiator_name?: string | null
          is_active?: boolean
          passkey?: string | null
          security_credential?: string | null
          shortcode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          category: Database["public"]["Enums"]["audit_category"]
          details: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          timestamp: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          category: Database["public"]["Enums"]["audit_category"]
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          category?: Database["public"]["Enums"]["audit_category"]
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      callback_logs: {
        Row: {
          callback_type: string
          error_message: string | null
          id: string
          ip_address: string | null
          is_valid: boolean | null
          payload: Json
          processed: boolean | null
          received_at: string
          signature: string | null
        }
        Insert: {
          callback_type: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          payload: Json
          processed?: boolean | null
          received_at?: string
          signature?: string | null
        }
        Update: {
          callback_type?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          payload?: Json
          processed?: boolean | null
          received_at?: string
          signature?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          account_number: string
          created_at: string
          email: string | null
          id: string
          last_transaction_date: string | null
          name: string
          phone_number: string
          status: string
          total_amount: number
          total_transactions: number
          updated_at: string
        }
        Insert: {
          account_number: string
          created_at?: string
          email?: string | null
          id?: string
          last_transaction_date?: string | null
          name: string
          phone_number: string
          status?: string
          total_amount?: number
          total_transactions?: number
          updated_at?: string
        }
        Update: {
          account_number?: string
          created_at?: string
          email?: string | null
          id?: string
          last_transaction_date?: string | null
          name?: string
          phone_number?: string
          status?: string
          total_amount?: number
          total_transactions?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      ratiba_subscriptions: {
        Row: {
          account_reference: string
          amount: number
          created_at: string
          customer_id: string | null
          customer_name: string
          frequency: Database["public"]["Enums"]["subscription_frequency"]
          id: string
          next_payment_date: string
          phone_number: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          account_reference: string
          amount: number
          created_at?: string
          customer_id?: string | null
          customer_name: string
          frequency: Database["public"]["Enums"]["subscription_frequency"]
          id?: string
          next_payment_date: string
          phone_number: string
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          account_reference?: string
          amount?: number
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          frequency?: Database["public"]["Enums"]["subscription_frequency"]
          id?: string
          next_payment_date?: string
          phone_number?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratiba_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliations: {
        Row: {
          created_at: string
          discrepancy_amount: number
          id: string
          matched_transactions: number
          notes: string | null
          reconciliation_date: string
          status: Database["public"]["Enums"]["reconciliation_status"]
          total_amount: number
          total_transactions: number
          unmatched_transactions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discrepancy_amount?: number
          id?: string
          matched_transactions?: number
          notes?: string | null
          reconciliation_date: string
          status?: Database["public"]["Enums"]["reconciliation_status"]
          total_amount?: number
          total_transactions?: number
          unmatched_transactions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discrepancy_amount?: number
          id?: string
          matched_transactions?: number
          notes?: string | null
          reconciliation_date?: string
          status?: Database["public"]["Enums"]["reconciliation_status"]
          total_amount?: number
          total_transactions?: number
          unmatched_transactions?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_reference: string
          amount: number
          conversation_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_name: string | null
          description: string | null
          id: string
          mpesa_receipt_number: string | null
          originator_conversation_id: string | null
          phone_number: string
          raw_callback_data: Json | null
          result_code: string | null
          result_desc: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_date: string | null
          transaction_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          account_reference: string
          amount: number
          conversation_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          originator_conversation_id?: string | null
          phone_number: string
          raw_callback_data?: Json | null
          result_code?: string | null
          result_desc?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_date?: string | null
          transaction_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          account_reference?: string
          amount?: number
          conversation_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          originator_conversation_id?: string | null
          phone_number?: string
          raw_callback_data?: Json | null
          result_code?: string | null
          result_desc?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_date?: string | null
          transaction_id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_finance: { Args: never; Returns: boolean }
      is_finance: { Args: never; Returns: boolean }
    }
    Enums: {
      audit_category:
        | "transaction"
        | "security"
        | "configuration"
        | "reconciliation"
      environment_type: "sandbox" | "production"
      reconciliation_status: "pending" | "reconciled" | "discrepancy"
      subscription_frequency: "daily" | "weekly" | "monthly"
      subscription_status: "active" | "paused" | "cancelled"
      transaction_status: "pending" | "completed" | "failed" | "reversed"
      transaction_type: "C2B" | "B2C" | "B2B" | "RATIBA"
      user_role: "admin" | "finance" | "viewer"
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
      audit_category: [
        "transaction",
        "security",
        "configuration",
        "reconciliation",
      ],
      environment_type: ["sandbox", "production"],
      reconciliation_status: ["pending", "reconciled", "discrepancy"],
      subscription_frequency: ["daily", "weekly", "monthly"],
      subscription_status: ["active", "paused", "cancelled"],
      transaction_status: ["pending", "completed", "failed", "reversed"],
      transaction_type: ["C2B", "B2C", "B2B", "RATIBA"],
      user_role: ["admin", "finance", "viewer"],
    },
  },
} as const
