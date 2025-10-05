"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "../../lib/supabase";
import type { Database } from "../../types/supabase";

type LoginFormProps = {
  supabaseConfigured: boolean;
};

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

type AccountRequestFormState = {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
};

const initialAccountRequestState: AccountRequestFormState = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  phone: "",
};

const fieldWrapperClass =
  "group relative overflow-hidden rounded-2xl border border-[#dbe4ff] bg-white/80 shadow-[0_18px_40px_-24px_rgba(38,66,145,0.45)] transition duration-300 focus-within:border-transparent focus-within:shadow-[0_24px_72px_-26px_rgba(52,88,189,0.55)]";
const fieldHighlightClass =
  "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5b8dff]/12 via-transparent to-[#ffb778]/18 opacity-0 transition duration-300 group-focus-within:opacity-100";
const inputClass =
  "relative z-10 w-full rounded-2xl border-0 bg-transparent px-5 py-[15px] text-[15px] font-medium text-[#10204b] placeholder:text-[#7a8cb6] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [accountForm, setAccountForm] = useState(initialAccountRequestState);

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
        router.replace("/coach");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        return;
      }

      setIsRedirecting(true);
      router.replace("/coach");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    setStatus(null);
  }, [mode]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Authentication is not configured yet. Please try again later.",
      });
      return;
    }

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier) {
      setStatus({
        type: "error",
        message: "Enter your username or business email.",
      });
      return;
    }

    if (!trimmedPassword) {
      setStatus({ type: "error", message: "Enter your password." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedIdentifier,
      password: trimmedPassword,
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Signed in successfully. Redirecting you to your dashboard…",
    });
  };

  const handleAccountFormChange = (field: keyof AccountRequestFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setAccountForm((previous) => ({ ...previous, [field]: value }));
    };

  const handleAccountRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValues = {
      firstName: accountForm.firstName.trim(),
      lastName: accountForm.lastName.trim(),
      businessName: accountForm.businessName.trim(),
      email: accountForm.email.trim(),
      phone: accountForm.phone.trim(),
    } as const;

    if (Object.values(trimmedValues).some((value) => !value)) {
      setStatus({
        type: "error",
        message: "Please complete every field so your mentor has the details they need.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsSubmitting(false);
    setAccountForm(initialAccountRequestState);
    setStatus({
      type: "success",
      message:
        "Thank you! Your mentor has been notified. You'll receive an email as soon as your access is approved.",
    });
  };

  const disableLogin = isSubmitting || isRedirecting;
  const disableAccountRequest = isSubmitting;
  const toggleDisabled = isSubmitting || isRedirecting;
  const isLogin = mode === "login";

  const handleModeChange = (nextMode: "login" | "signup") => {
    if (toggleDisabled || mode === nextMode) {
      return;
    }

    setMode(nextMode);
  };

  const toggleButtonClass = (active: boolean) =>
    `relative flex-1 overflow-hidden rounded-2xl px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3147ff]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
      active
        ? "bg-gradient-to-r from-[#2f5aff] via-[#5f7bff] to-[#ff9653] text-white shadow-[0_14px_34px_rgba(46,82,200,0.45)]"
        : "text-[#5e6f9a] hover:text-[#162d70]"
    }`;

  const submitButtonBase =
    "inline-flex w-full items-center justify-center rounded-2xl px-5 py-[15px] text-[12px] font-semibold uppercase tracking-[0.42em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2a55ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section aria-labelledby="login-panel" className="space-y-8">
      <div className="rounded-[28px] bg-white/70 p-1 shadow-[0_18px_46px_rgba(35,58,132,0.25)]">
        <div className="flex gap-2 rounded-[24px] bg-white/90 p-1">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={toggleButtonClass(isLogin)}
            aria-pressed={isLogin}
            disabled={toggleDisabled}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("signup")}
            className={toggleButtonClass(!isLogin)}
            aria-pressed={!isLogin}
            disabled={toggleDisabled}
          >
            Request access
          </button>
        </div>
      </div>

      {isLogin ? (
        <form className="space-y-6" onSubmit={handleLoginSubmit} aria-busy={disableLogin}>
          <div className="space-y-2 text-center">
            <h2 id="login-panel" className="text-2xl font-semibold text-[#0b1f3f]">
              Welcome back, Triumph leader
            </h2>
            <p className="text-sm text-[#4f5f82]">
              Slide into your command center and sync with your mentor in moments.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <label className="block text-sm font-semibold text-[#10254a]" htmlFor="identifier">
              Username or business email
            </label>
            <div className={fieldWrapperClass}>
              <div className={fieldHighlightClass} />
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="you@triumph.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                disabled={disableLogin}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="block text-sm font-semibold text-[#10254a]" htmlFor="password">
              Password
            </label>
            <div className={fieldWrapperClass}>
              <div className={fieldHighlightClass} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={disableLogin}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`${submitButtonBase} bg-gradient-to-r from-[#2f5aff] via-[#496dff] to-[#ff7c3a] text-white shadow-[0_26px_56px_-24px_rgba(31,72,180,0.65)] hover:from-[#234fea] hover:via-[#3a60f0] hover:to-[#ff6f1f]`}
            disabled={disableLogin || !identifier || !password}
          >
            {isSubmitting ? "Signing in…" : "Enter the studio"}
          </button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={handleAccountRequestSubmit} aria-busy={disableAccountRequest}>
          <div className="space-y-2 text-center">
            <h2 id="login-panel" className="text-2xl font-semibold text-[#0b1f3f]">
              Request your Triumph access
            </h2>
            <p className="text-sm text-[#4f5f82]">
              Share the essentials so your mentor can unlock the Business Revenue Model App for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#10254a]" htmlFor="firstName">
                First name
              </label>
              <div className={fieldWrapperClass}>
                <div className={fieldHighlightClass} />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jordan"
                  value={accountForm.firstName}
                  onChange={handleAccountFormChange("firstName")}
                  disabled={disableAccountRequest}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#10254a]" htmlFor="lastName">
                Last name
              </label>
              <div className={fieldWrapperClass}>
                <div className={fieldHighlightClass} />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Rivera"
                  value={accountForm.lastName}
                  onChange={handleAccountFormChange("lastName")}
                  disabled={disableAccountRequest}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#10254a]" htmlFor="businessName">
              Business name
            </label>
            <div className={fieldWrapperClass}>
              <div className={fieldHighlightClass} />
              <input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                placeholder="Triumph Studios"
                value={accountForm.businessName}
                onChange={handleAccountFormChange("businessName")}
                disabled={disableAccountRequest}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#10254a]" htmlFor="requestEmail">
                Work email
              </label>
              <div className={fieldWrapperClass}>
                <div className={fieldHighlightClass} />
                <input
                  id="requestEmail"
                  name="requestEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="hello@business.com"
                  value={accountForm.email}
                  onChange={handleAccountFormChange("email")}
                  disabled={disableAccountRequest}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#10254a]" htmlFor="phone">
                Phone number
              </label>
              <div className={fieldWrapperClass}>
                <div className={fieldHighlightClass} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={accountForm.phone}
                  onChange={handleAccountFormChange("phone")}
                  disabled={disableAccountRequest}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`${submitButtonBase} bg-gradient-to-r from-[#ff8a3a] via-[#ffa45a] to-[#ffd07a] text-[#311600] shadow-[0_26px_54px_-24px_rgba(250,145,0,0.55)] hover:from-[#ff7a1f] hover:via-[#ff9741] hover:to-[#ffcb66]`}
            disabled={disableAccountRequest}
          >
            {isSubmitting ? "Submitting…" : "Notify my mentor"}
          </button>
        </form>
      )}

      {status && (
        <div
          className={`relative overflow-hidden rounded-2xl border px-5 py-4 text-sm shadow-[0_18px_40px_-28px_rgba(15,40,95,0.45)] transition ${
            status.type === "success"
              ? "border-emerald-200/70 bg-emerald-50/95 text-emerald-800"
              : "border-rose-200/70 bg-rose-50/95 text-rose-700"
          }`}
          role={status.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/60 opacity-80" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-semibold">
              {status.type === "success" ? "✓" : "!"}
            </span>
            <span>{status.message}</span>
          </div>
        </div>
      )}

      {!supabaseConfigured && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-center text-xs text-amber-800" role="note">
          Supabase credentials are not configured. Sign-in will be available once the environment is ready.
        </p>
      )}

      {isRedirecting && (
        <div
          className="flex items-center justify-center gap-2 rounded-full bg-[#e7edff] px-4 py-2 text-sm text-[#2c3f6d]"
          role="status"
          aria-live="polite"
        >
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Redirecting to your dashboard…
        </div>
      )}
    </section>
  );
}
