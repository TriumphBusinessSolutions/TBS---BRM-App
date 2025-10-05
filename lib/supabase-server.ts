// lib/supabase-server.ts
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type CookiePayload = {
  access_token?: string;
  refresh_token?: string;
  currentSession?: {
    access_token?: string;
    refresh_token?: string;
  } | null;
  session?: {
    access_token?: string;
    refresh_token?: string;
  } | null;
};

function extractAuthTokens(rawCookie: string | undefined) {
  if (!rawCookie) {
    return { accessToken: undefined };
  }

  try {
    const parsed = JSON.parse(rawCookie) as CookiePayload;
    const accessToken =
      parsed.currentSession?.access_token ??
      parsed.session?.access_token ??
      parsed.access_token;

    return { accessToken };
  } catch (error) {
    console.warn("Failed to parse Supabase auth cookie", error);
    return { accessToken: undefined };
  }
}

function getProjectRef(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname.split(".")[0];
  } catch (error) {
    console.warn("Invalid Supabase URL", error);
    return null;
  }
}

/**
 * Returns a lightweight Supabase client configured for server-side usage.
 * When an authenticated session cookie is available, the access token is
 * forwarded through the Authorization header so subsequent queries execute on
 * behalf of the signed-in user.
 */
export function getServerClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const projectRef = getProjectRef(supabaseUrl);
  const cookieStore = cookies();
  const authCookieName = projectRef ? `sb-${projectRef}-auth-token` : null;
  const rawCookie = authCookieName
    ? cookieStore.get(authCookieName)?.value
    : undefined;
  const { accessToken } = extractAuthTokens(rawCookie);

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}
