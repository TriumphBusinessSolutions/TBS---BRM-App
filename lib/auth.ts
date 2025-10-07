import type { Session, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

export type SupportedUserRole = "mentor_admin" | "mentor" | "client";

const ROLE_DESTINATION_MAP: Record<SupportedUserRole, string> = {
  mentor_admin: "/mentor/home",
  mentor: "/mentor/home",
  client: "/client",
};

const PENDING_APPROVAL_ROUTE = "/pending-approval";

type RoleResolutionResult = {
  destination: string;
  role: SupportedUserRole | null;
};

type Metadata = Record<string, unknown> | undefined;

const normalizeRole = (role: unknown): SupportedUserRole | null => {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  if (normalized === "mentor_admin" || normalized === "mentor" || normalized === "client") {
    return normalized as SupportedUserRole;
  }

  return null;
};

const resolveDestinationForRole = (role: SupportedUserRole | null): RoleResolutionResult => {
  if (!role) {
    return { destination: PENDING_APPROVAL_ROUTE, role: null };
  }

  const destination = ROLE_DESTINATION_MAP[role];

  if (!destination) {
    return { destination: PENDING_APPROVAL_ROUTE, role: null };
  }

  console.log(`[resolveRoleRedirect] Redirecting role "${role}" to "${destination}".`);

  return { destination, role };
};

export const resolveRoleRedirect = async (
  supabase: SupabaseClient<Database>,
  session: Session,
): Promise<RoleResolutionResult> => {
  const appMetadataRole = normalizeRole((session.user.app_metadata as Metadata)?.role);
  const userMetadataRole = normalizeRole((session.user.user_metadata as Metadata)?.role);
  const metadataRole = appMetadataRole ?? userMetadataRole ?? null;

  if (metadataRole) {
    return resolveDestinationForRole(metadataRole);
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle<{ role: string | null }>();

    if (error) {
      console.error("[resolveRoleRedirect] Failed to fetch role from profiles table:", error);
    }

    const profileRole = normalizeRole(data?.role ?? null);

    if (profileRole) {
      return resolveDestinationForRole(profileRole);
    }

    if (data?.role) {
      console.warn(
        `[resolveRoleRedirect] Received unexpected role value "${data.role}" for user ${session.user.id}. Redirecting to pending approval.`,
      );
    }
  } catch (error) {
    console.error("[resolveRoleRedirect] Unexpected error while resolving role redirect:", error);
  }

  console.log(
    `[resolveRoleRedirect] No role found for user ${session.user.id}. Redirecting to pending approval until access is confirmed.`,
  );

  return { destination: PENDING_APPROVAL_ROUTE, role: null };
};

export { PENDING_APPROVAL_ROUTE };
