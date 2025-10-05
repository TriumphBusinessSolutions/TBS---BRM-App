// lib/supabase-server.ts
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Lightweight server-side Supabase client that reuses the access token stored
 * in Supabase's auth cookies. We only need read/write access on behalf of the
 * signed-in user, so persisting or mutating cookies isn't necessary here.
 */
export function getServerClient() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}
