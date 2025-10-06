"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { PENDING_APPROVAL_ROUTE, resolveRoleRedirect } from "@/lib/auth";
import type { Database } from "@/types/supabase";

type UseRoleRedirectOptions = {
  supabase: SupabaseClient<Database> | null;
  enabled?: boolean;
  onRedirectStart?: () => void;
  onRedirectEnd?: () => void;
};

type HandleRoleRedirect = (session: Session | null, reason?: string) => Promise<void>;

export const useRoleRedirect = ({
  supabase,
  enabled = true,
  onRedirectStart,
  onRedirectEnd,
}: UseRoleRedirectOptions) => {
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const handleRoleRedirect = useCallback<HandleRoleRedirect>(
    async (session, reason) => {
      if (!enabled || !session || !supabase) {
        return;
      }

      setIsCheckingRole(true);
      onRedirectStart?.();

      try {
        const { destination, role } = await resolveRoleRedirect(supabase, session);
        console.log(
          `[useRoleRedirect] Redirecting user ${session.user.id} (${role ?? "unknown"}) to ${destination}${
            reason ? ` [${reason}]` : ""
          }`,
        );
        router.replace(destination);
      } catch (error) {
        console.error("[useRoleRedirect] Failed to resolve role-based redirect:", error);
        router.replace(PENDING_APPROVAL_ROUTE);
      } finally {
        setIsCheckingRole(false);
        onRedirectEnd?.();
      }
    },
    [enabled, onRedirectEnd, onRedirectStart, router, supabase],
  );

  useEffect(() => {
    if (!enabled || !supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      void handleRoleRedirect(data.session, "existing session");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        return;
      }

      void handleRoleRedirect(session, "auth state change");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [enabled, handleRoleRedirect, supabase]);

  return {
    handleRoleRedirect,
    isCheckingRole,
  };
};
