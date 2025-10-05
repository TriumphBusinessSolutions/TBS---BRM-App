export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Nullable<T> = T | null;

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: Nullable<string>;
          phone: Nullable<string>;
          created_at: Nullable<Timestamp>;
          updated_at: Nullable<Timestamp>;
        };
        Insert: {
          id?: string;
          name: string;
          email?: Nullable<string>;
          phone?: Nullable<string>;
          created_at?: Nullable<Timestamp>;
          updated_at?: Nullable<Timestamp>;
        };
        Update: {
          id?: string;
          name?: string;
          email?: Nullable<string>;
          phone?: Nullable<string>;
          created_at?: Nullable<Timestamp>;
          updated_at?: Nullable<Timestamp>;
        };
        Relationships: [];
      };
      models: {
        Row: {
          id: string;
          client_id: string;
          level: Nullable<string>;
          status: Nullable<string>;
          created_at: Nullable<Timestamp>;
          updated_at: Nullable<Timestamp>;
        };
        Insert: {
          id?: string;
          client_id: string;
          level?: Nullable<string>;
          status?: Nullable<string>;
          created_at?: Nullable<Timestamp>;
          updated_at?: Nullable<Timestamp>;
        };
        Update: {
          id?: string;
          client_id?: string;
          level?: Nullable<string>;
          status?: Nullable<string>;
          created_at?: Nullable<Timestamp>;
          updated_at?: Nullable<Timestamp>;
        };
        Relationships: [
          {
            foreignKeyName: "models_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
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
      client_business_profiles: {
        Row: {
          user_id: string;
          business_name: string | null;
          industry: string | null;
          business_type: string | null;
          top_service_one: string | null;
          top_service_two: string | null;
          top_service_three: string | null;
          key_details: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          business_name?: string | null;
          industry?: string | null;
          business_type?: string | null;
          top_service_one?: string | null;
          top_service_two?: string | null;
          top_service_three?: string | null;
          key_details?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          business_name?: string | null;
          industry?: string | null;
          business_type?: string | null;
          top_service_one?: string | null;
          top_service_two?: string | null;
          top_service_three?: string | null;
          key_details?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_business_profiles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      client_business_information: {
        Row: {
          id: string;
          client_id: string;
          created_at: Nullable<Timestamp>;
          updated_at: Nullable<Timestamp>;
          business_name: Nullable<string>;
          ideal_client_profile: Nullable<string>;
          primary_offer: Nullable<string>;
          primary_offer_promise: Nullable<string>;
          primary_offer_price: Nullable<string>;
          primary_marketing_channel: Nullable<string>;
          average_client_value: Nullable<string>;
          average_monthly_revenue: Nullable<string>;
          monthly_revenue_goal: Nullable<string>;
          sales_process: Nullable<string>;
          fulfillment_bottleneck: Nullable<string>;
          team_size: Nullable<string>;
          growth_goal: Nullable<string>;
          notes: Nullable<string>;
          [key: string]: string | number | boolean | null | undefined;
        };
        Insert: {
          id?: string;
          client_id: string;
          created_at?: Nullable<Timestamp>;
          updated_at?: Nullable<Timestamp>;
          business_name?: Nullable<string>;
          ideal_client_profile?: Nullable<string>;
          primary_offer?: Nullable<string>;
          primary_offer_promise?: Nullable<string>;
          primary_offer_price?: Nullable<string>;
          primary_marketing_channel?: Nullable<string>;
          average_client_value?: Nullable<string>;
          average_monthly_revenue?: Nullable<string>;
          monthly_revenue_goal?: Nullable<string>;
          sales_process?: Nullable<string>;
          fulfillment_bottleneck?: Nullable<string>;
          team_size?: Nullable<string>;
          growth_goal?: Nullable<string>;
          notes?: Nullable<string>;
          [key: string]: string | number | boolean | null | undefined;
        };
        Update: {
          id?: string;
          client_id?: string;
          created_at?: Nullable<Timestamp>;
          updated_at?: Nullable<Timestamp>;
          business_name?: Nullable<string>;
          ideal_client_profile?: Nullable<string>;
          primary_offer?: Nullable<string>;
          primary_offer_promise?: Nullable<string>;
          primary_offer_price?: Nullable<string>;
          primary_marketing_channel?: Nullable<string>;
          average_client_value?: Nullable<string>;
          average_monthly_revenue?: Nullable<string>;
          monthly_revenue_goal?: Nullable<string>;
          sales_process?: Nullable<string>;
          fulfillment_bottleneck?: Nullable<string>;
          team_size?: Nullable<string>;
          growth_goal?: Nullable<string>;
          notes?: Nullable<string>;
          [key: string]: string | number | boolean | null | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "client_business_information_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
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
