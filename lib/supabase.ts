import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

let browserClient: SupabaseClient<Database> | null = null;
let serverClient: SupabaseClient<Database> | null = null;

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (typeof window !== "undefined") {
    return getSupabaseBrowserClient();
  }

  if (serverClient) {
    return serverClient;
  }

  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  serverClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (browserClient) {
    return browserClient;
  }

  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  browserClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseEnv());
}
