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
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
