import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PENDING_APPROVAL_ROUTE, resolveRoleRedirect } from "@/lib/auth";
import { getServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Dashboard | Business Revenue Model App",
};

export default async function DashboardPage() {
  const supabase = getServerClient();

  if (!supabase) {
    redirect("/mentor/home");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  try {
    const { destination } = await resolveRoleRedirect(supabase, session);
    redirect(destination);
  } catch (error) {
    console.error("[dashboard] Failed to resolve role redirect", error);
    redirect(PENDING_APPROVAL_ROUTE);
  }
  return null;
}
