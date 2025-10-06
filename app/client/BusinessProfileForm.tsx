"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import type { Database } from "../../types/supabase";

type ClientBusinessProfile = {
  business_name: string | null;
  industry: string | null;
  business_type: string | null;
  top_service_one: string | null;
  top_service_two: string | null;
  top_service_three: string | null;
  key_details: string | null;
};

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

const emptyProfile: ClientBusinessProfile = {
  business_name: "",
  industry: "",
  business_type: "",
  top_service_one: "",
  top_service_two: "",
  top_service_three: "",
  key_details: "",
};

const SERVICE_PROGRAM_FIELDS: Array<{
  key: "top_service_one" | "top_service_two" | "top_service_three";
  label: string;
  placeholder: string;
}> = [
  {
    key: "top_service_one",
    label: "Top service or program #1",
    placeholder: "e.g. Revenue Momentum Intensive",
  },
  {
    key: "top_service_two",
    label: "Top service or program #2",
    placeholder: "e.g. Retainer: Growth Strategy Mentorship",
  },
  {
    key: "top_service_three",
    label: "Top service or program #3",
    placeholder: "e.g. VIP Day: Market Expansion Sprint",
  },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "b2b", label: "B2B" },
  { value: "b2c", label: "B2C" },
  { value: "hybrid", label: "Hybrid" },
  { value: "other", label: "Other" },
];

export default function BusinessProfileForm() {
  const supabase = useMemo<SupabaseClient<Database> | null>(() => {
    return getSupabaseBrowserClient();
  }, []);

  const [profile, setProfile] = useState<ClientBusinessProfile>(emptyProfile);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Supabase environment variables are not configured. Please contact support.",
      });
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;

    async function loadProfile(currentClient: SupabaseClient<Database>) {
      setIsLoading(true);
      setStatus(null);

      const { data: authData, error: authError } = await currentClient.auth.getUser();
      if (!isMounted) {
        return;
      }

      if (authError || !authData?.user) {
        setStatus({
          type: "error",
          message:
            authError?.message ??
            "We couldn’t verify your account. Please refresh and try again.",
        });
        setIsLoading(false);
        return;
      }

      const currentUserId = authData.user.id;
      setUserId(currentUserId);

      const { data, error } = await currentClient
        .from("client_business_profiles")
        .select(
          "business_name, industry, business_type, top_service_one, top_service_two, top_service_three, key_details",
        )
        .eq("user_id", currentUserId)
        .maybeSingle<ClientBusinessProfile>();

      if (!isMounted) {
        return;
      }

      if (error) {
        setStatus({ type: "error", message: error.message });
        setIsLoading(false);
        return;
      }

      if (data) {
        setProfile({
          business_name: data.business_name ?? "",
          industry: data.industry ?? "",
          business_type: data.business_type ?? "",
          top_service_one: data.top_service_one ?? "",
          top_service_two: data.top_service_two ?? "",
          top_service_three: data.top_service_three ?? "",
          key_details: data.key_details ?? "",
        });
      } else {
        setProfile(emptyProfile);
      }

      setIsLoading(false);
    }

    void loadProfile(client);

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleChange = (
    field: keyof ClientBusinessProfile,
    value: string,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Supabase environment variables are not configured. Please contact support.",
      });
      return;
    }

    if (!userId) {
      setStatus({
        type: "error",
        message: "You must be signed in to update your business profile.",
      });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    const { error } = await supabase
      .from("client_business_profiles")
      .upsert(
        {
          user_id: userId,
          business_name: profile.business_name?.trim() || null,
          industry: profile.industry?.trim() || null,
          business_type: profile.business_type?.trim() || null,
          top_service_one: profile.top_service_one?.trim() || null,
          top_service_two: profile.top_service_two?.trim() || null,
          top_service_three: profile.top_service_three?.trim() || null,
          key_details: profile.key_details?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    setIsSaving(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Business profile saved. Your mentor now has the latest details.",
    });
  };

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_45px_140px_rgba(1,9,30,0.35)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-8 h-64 w-64 rounded-full bg-[#004aad]/40 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-[#fa9100]/30 blur-[140px]" />
      </div>
      <div className="relative flex flex-col gap-8 px-8 py-12 md:px-12">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/80">
            Business Foundations
          </div>
          <h2 className="text-3xl font-semibold text-slate-50">Share your business story</h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Give your Triumph mentor the context they need to champion you throughout the program. A rich profile keeps every planning session, prompt, and milestone aligned with what matters most to your business.
          </p>
        </div>

        {status ? (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              status.type === "success"
                ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                : "border-rose-400/40 bg-rose-500/15 text-rose-200"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm font-medium text-slate-300">Loading your business profile…</p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-200"
              htmlFor="business_name"
            >
              Business name
            </label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              placeholder="e.g. Triumph Solutions"
              value={profile.business_name ?? ""}
              onChange={(event) => handleChange("business_name", event.target.value)}
              disabled={isLoading || isSaving}
              className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 text-sm text-slate-100 shadow-[0_16px_40px_rgba(2,10,36,0.45)] transition focus:border-[#fa9100] focus:outline-none focus:ring-2 focus:ring-[#fa9100]/30 disabled:cursor-not-allowed disabled:bg-slate-900/60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200" htmlFor="industry">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              placeholder="e.g. Professional Services"
              value={profile.industry ?? ""}
              onChange={(event) => handleChange("industry", event.target.value)}
              disabled={isLoading || isSaving}
              className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 text-sm text-slate-100 shadow-[0_16px_40px_rgba(2,10,36,0.45)] transition focus:border-[#fa9100] focus:outline-none focus:ring-2 focus:ring-[#fa9100]/30 disabled:cursor-not-allowed disabled:bg-slate-900/60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-200"
              htmlFor="business_type"
            >
              Business type
            </label>
            <select
              id="business_type"
              name="business_type"
              value={profile.business_type ?? ""}
              onChange={(event) => handleChange("business_type", event.target.value)}
              disabled={isLoading || isSaving}
              className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 text-sm text-slate-100 shadow-[0_16px_40px_rgba(2,10,36,0.45)] transition focus:border-[#fa9100] focus:outline-none focus:ring-2 focus:ring-[#fa9100]/30 disabled:cursor-not-allowed disabled:bg-slate-900/60"
            >
              <option value="">Select type</option>
              {BUSINESS_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="col-span-full rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <legend className="px-2 text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
              Top services & programs
            </legend>
            <p className="mt-2 text-xs text-slate-400">
              Highlight up to three flagship offers. We’ll reference these individually across materials, recaps, and mentor planning.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {SERVICE_PROGRAM_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400" htmlFor={key}>
                    {label}
                  </label>
                  <input
                    id={key}
                    name={key}
                    type="text"
                    placeholder={placeholder}
                    value={profile[key] ?? ""}
                    onChange={(event) => handleChange(key, event.target.value)}
                    disabled={isLoading || isSaving}
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 shadow-[0_12px_32px_rgba(2,10,36,0.45)] transition focus:border-[#fa9100] focus:outline-none focus:ring-2 focus:ring-[#fa9100]/30 disabled:cursor-not-allowed disabled:bg-slate-900/60"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <div className="col-span-full flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-200"
              htmlFor="key_details"
            >
              Program notes & momentum markers
            </label>
            <textarea
              id="key_details"
              name="key_details"
              placeholder="Share goals, milestones, target audiences, seasonal considerations, partnerships, or anything your mentor should track."
              value={profile.key_details ?? ""}
              onChange={(event) => handleChange("key_details", event.target.value)}
              disabled={isLoading || isSaving}
              className="min-h-[160px] w-full rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-slate-100 shadow-[0_20px_50px_rgba(2,10,36,0.45)] transition focus:border-[#fa9100] focus:outline-none focus:ring-2 focus:ring-[#fa9100]/30 disabled:cursor-not-allowed disabled:bg-slate-900/60"
            />
          </div>

          <div className="col-span-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Updates save instantly for your mentor and the Triumph team to reference across the program.
            </p>
            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#fa9100] via-[#ffb341] to-[#8fd6ff] px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_25px_70px_rgba(250,145,0,0.35)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#fa9100]/40 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save business profile"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
