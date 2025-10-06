"use client";

import { useEffect, useMemo, useState } from "react";

import BusinessInfoForm from "../../components/BusinessInfoForm";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import type { Database } from "../../types/supabase";

type BusinessInformationModalProps = {
  open: boolean;
  onClose: () => void;
};

type BusinessContextRow = Database["public"]["Tables"]["business_context"]["Row"];
type OfferStackRow = Database["public"]["Tables"]["offer_stack"]["Row"];
type BrmLevel = Database["public"]["Enums"]["brm_level"];

const BRM_LEVEL_FALLBACK: BrmLevel = "level_1";

type FormSnapshot = {
  brmLevel: BrmLevel;
  initialContext: BusinessContextRow | null;
  initialOffers: OfferStackRow[];
};

export default function BusinessInformationModal({ open, onClose }: BusinessInformationModalProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [snapshot, setSnapshot] = useState<FormSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!supabase) {
      setLoadError("Supabase is not configured. Add your project keys to load the business information form.");
      setSnapshot({
        brmLevel: BRM_LEVEL_FALLBACK,
        initialContext: null,
        initialOffers: [],
      });
      setIsLoading(false);
      return;
    }

    const supabaseClient = supabase;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    async function loadBusinessInformation() {
      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError) {
        setLoadError("We couldn’t verify your session. You can still review the form below.");
        setSnapshot({
          brmLevel: BRM_LEVEL_FALLBACK,
          initialContext: null,
          initialOffers: [],
        });
        setIsLoading(false);
        return;
      }

      if (!user) {
        setLoadError("Sign in to save your business information.");
        setSnapshot({
          brmLevel: BRM_LEVEL_FALLBACK,
          initialContext: null,
          initialOffers: [],
        });
        setIsLoading(false);
        return;
      }

      const [contextResult, offerResult] = await Promise.all([
        supabaseClient
          .from("business_context")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle<BusinessContextRow>(),
        supabaseClient
          .from("offer_stack")
          .select("*")
          .eq("user_id", user.id)
          .order("slot", { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      if (contextResult.error) {
        setLoadError("We couldn’t load your saved context yet. You can still update the form below.");
      } else if (offerResult.error) {
        setLoadError("We couldn’t load your offer stack yet. You can still update the form below.");
      } else {
        setLoadError(null);
      }

      const metadataLevel =
        ((user.user_metadata as { brm_level?: BrmLevel } | undefined)?.brm_level ??
          (user.app_metadata as { brm_level?: BrmLevel } | undefined)?.brm_level ??
          null) ?? BRM_LEVEL_FALLBACK;

      const contextData = contextResult.data ?? null;
      const offerData = offerResult.data ?? [];

      const brmLevel = (contextData?.brm_level as BrmLevel | null) ?? metadataLevel;

      setSnapshot({
        brmLevel,
        initialContext: contextData,
        initialOffers: offerData,
      });
      setIsLoading(false);
    }

    void loadBusinessInformation();

    return () => {
      isMounted = false;
    };
  }, [open, supabase, reloadToken]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setSnapshot(null);
    setIsLoading(false);
    setLoadError(null);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
    setReloadToken((token) => token + 1);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Business information form">
      <div className="modal-card modal-card--form">
        <button
          type="button"
          className="modal-close-button"
          onClick={handleClose}
          aria-label="Close business information form"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="modal-form-wrapper">
          {isLoading ? (
            <p className="modal-status">Loading your saved details…</p>
          ) : snapshot ? (
            <>
              {loadError ? <p className="modal-status error-text">{loadError}</p> : null}
              <BusinessInfoForm
                brmLevel={snapshot.brmLevel}
                initialContext={snapshot.initialContext}
                initialOffers={snapshot.initialOffers}
                onSuccess={handleSuccess}
              />
            </>
          ) : (
            <p className="modal-status error-text">
              {loadError ?? "We couldn’t load the business information form right now. Please try again later."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
