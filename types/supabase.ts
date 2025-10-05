export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      business_context: {
        Row: {
          avg_txn_value: number | null;
          brm_level: Database["public"]["Enums"]["brm_level"];
          core_promise: string;
          created_at: string | null;
          has_upsells: boolean;
          notes: string | null;
          offer_type: Database["public"]["Enums"]["offer_type"];
          retention_model: Database["public"]["Enums"]["retention_model"] | null;
          revenue_band: Database["public"]["Enums"]["revenue_band"];
          traffic_source: Database["public"]["Enums"]["traffic_source"] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          avg_txn_value?: number | null;
          brm_level: Database["public"]["Enums"]["brm_level"];
          core_promise: string;
          created_at?: string | null;
          has_upsells?: boolean;
          notes?: string | null;
          offer_type: Database["public"]["Enums"]["offer_type"];
          retention_model?: Database["public"]["Enums"]["retention_model"] | null;
          revenue_band: Database["public"]["Enums"]["revenue_band"];
          traffic_source?: Database["public"]["Enums"]["traffic_source"] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          avg_txn_value?: number | null;
          brm_level?: Database["public"]["Enums"]["brm_level"];
          core_promise?: string;
          created_at?: string | null;
          has_upsells?: boolean;
          notes?: string | null;
          offer_type?: Database["public"]["Enums"]["offer_type"];
          retention_model?: Database["public"]["Enums"]["retention_model"] | null;
          revenue_band?: Database["public"]["Enums"]["revenue_band"];
          traffic_source?: Database["public"]["Enums"]["traffic_source"] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_context_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_stack: {
        Row: {
          created_at: string | null;
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"] | null;
          name: string;
          price_point: number | null;
          primary_outcome: string | null;
          slot: 1 | 2 | 3;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"] | null;
          name: string;
          price_point?: number | null;
          primary_outcome?: string | null;
          slot: 1 | 2 | 3;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"] | null;
          name?: string;
          price_point?: number | null;
          primary_outcome?: string | null;
          slot?: 1 | 2 | 3;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_stack_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_brm_profile: {
        Args: {
          payload: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      brm_level: "level_1" | "level_2_3" | "level_4";
      fulfillment_type: "one_to_one" | "group" | "self_serve" | "hybrid";
      offer_type:
        | "service"
        | "coaching"
        | "agency"
        | "saas"
        | "ecommerce"
        | "local_bm"
        | "info_product";
      retention_model:
        | "one_off"
        | "package"
        | "subscription"
        | "retainer"
        | "none";
      revenue_band:
        | "pre_revenue"
        | "lt_250k"
        | "_250k_to_1m"
        | "_1m_to_5m"
        | "gt_5m";
      traffic_source: "organic" | "paid" | "referrals" | "partnerships" | "other";
    };
    CompositeTypes: Record<string, never>;
  };
};
