// lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

let browserClient: SupabaseClient<Database> | null = null;
let serverClient: SupabaseClient<Database> | null = null;

function getSupabaseEnvOrThrow() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") return getSupabaseBrowserClient();
  if (serverClient) return serverClient;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvOrThrow();
  serverClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvOrThrow();
  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseEnvOrThrow();
    return true;
  } catch {
    return false;
  }
}
