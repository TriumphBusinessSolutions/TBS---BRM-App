import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BusinessInfoForm from "../../../components/BusinessInfoForm";
import { getServerClient } from "../../../lib/supabase-server";
import type { Database } from "../../../types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Business Info | TBS BRM App",
};

const BRM_LEVEL_FALLBACK: Database["public"]["Enums"]["brm_level"] = "level_1";

export default async function BusinessInfoSettingsPage() {
  const supabase = getServerClient() as SupabaseClient<Database>;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role =
    (user.app_metadata as { role?: string } | undefined)?.role ??
    (user.user_metadata as { role?: string } | undefined)?.role ??
    null;

  if (role !== "client") {
    redirect("/login");
  }

  const { data: contextData } = await supabase
    .from("business_context")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: offerData } = await supabase
    .from("offer_stack")
    .select("*")
    .eq("user_id", user.id)
    .order("slot", { ascending: true });

  const brmLevel =
    contextData?.brm_level ??
    ((user.user_metadata as { brm_level?: Database["public"]["Enums"]["brm_level"] } | undefined)?.brm_level ??
      BRM_LEVEL_FALLBACK);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <BusinessInfoForm
        brmLevel={brmLevel}
        initialContext={contextData ?? null}
        initialOffers={offerData ?? []}
      />
    </main>
  );
}
