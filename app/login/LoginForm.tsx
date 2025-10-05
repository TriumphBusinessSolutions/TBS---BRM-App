"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import type { Database } from "../../types/supabase";

type LoginFormProps = {
  googleAvailable: boolean;
  supabaseConfigured: boolean;
};

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

const resolveDashboardPath = (session: Session | null) => {
  const appMetaRole =
    (session?.user?.app_metadata as { role?: string } | undefined)?.role ??
    (session?.user?.user_metadata as { role?: string } | undefined)?.role;

  if (appMetaRole === "coach") {
    return "/coach";
  }

  return "/client";
};

export default function LoginForm({
  googleAvailable,
  supabaseConfigured,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const supabase = useMemo<SupabaseClient<Database> | null>(() => {
    if (!supabaseConfigured) {
      return null;
    }

    return getSupabaseBrowserClient();
  }, [supabaseConfigured]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      if (data.session) {
        setIsRedirecting(true);
        router.replace(resolveDashboardPath(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        return;
      }

      setIsRedirecting(true);
      router.replace(resolveDashboardPath(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Authentication is not configured yet. Please try again later.",
      });
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus({
        type: "error",
        message: "Enter the email address you use with TBS BRM.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Check your email for a sign-in link.",
    });
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setStatus({
        type: "error",
        message: "Authentication is not configured yet. Please try again later.",
      });
      return;
    }

    setIsGoogleLoading(true);
    setStatus(null);

    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/client`,
      },
    });

    setIsGoogleLoading(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  const disableForm = isSubmitting || isRedirecting || !supabaseConfigured;
  const disableGoogle = disableForm || isGoogleLoading || !googleAvailable;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6" aria-busy={disableForm}>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Sign in to TBS BRM</h1>
            <p className="text-sm text-slate-500">
              We&#39;ll send a magic link to your inbox.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={disableForm}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={disableForm}
          >
            {isSubmitting ? "Sending…" : "Send magic link"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
          <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          <span>or continue with</span>
          <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={disableGoogle}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
        >
          {isGoogleLoading ? (
            <svg
              className="h-4 w-4 animate-spin text-indigo-600"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-slate-500"
              viewBox="0 0 533.5 544.3"
              aria-hidden="true"
            >
              <path
                d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.2H272v95h147.1c-6.4 34.5-25.9 63.8-55.2 83.4v69.2h89.2c52.1-48 80.4-118.8 80.4-197.4z"
                fill="#4285f4"
              />
              <path
                d="M272 544.3c74.8 0 137.5-24.8 183.3-67.2l-89.2-69.2c-24.8 16.7-56.5 26.6-94.1 26.6-72.4 0-133.9-48.9-155.9-114.5H23.9v71.9C69.4 482.3 164.5 544.3 272 544.3z"
                fill="#34a853"
              />
              <path
                d="M116.1 319.9c-10.8-32.5-10.8-67.5 0-100l-92.2-71.9C3.6 210 0 240.9 0 272s3.6 62 23.9 123.9l92.2-71.9z"
                fill="#fbbc04"
              />
              <path
                d="M272 107.7c39.5-.6 77.2 13.6 106.3 39.7l79.7-79.7C407.2 24.5 345 0 272 0 164.5 0 69.4 61.9 23.9 176.1l92.2 71.9C138.1 156.6 199.6 107.7 272 107.7z"
                fill="#ea4335"
              />
            </svg>
          )}
          Continue with Google
        </button>

        {!googleAvailable && (
          <p className="mt-2 text-center text-xs text-slate-400" role="note">
            Google sign-in isn&#39;t available in this environment.
          </p>
        )}

        {!supabaseConfigured && (
          <p className="mt-4 text-center text-xs text-amber-600" role="alert">
            Supabase credentials are not configured. Sign-in is disabled until the environment is
            ready.
          </p>
        )}

        {status && (
          <div
            className={`mt-6 rounded-lg border px-3 py-2 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
            role={status.type === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {status.message}
          </div>
        )}

        {isRedirecting && (
          <div
            className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"
            role="status"
            aria-live="polite"
          >
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Redirecting to your dashboard…
          </div>
        )}
      </div>
    </div>
  );
}
