"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type LoginFormProps = {
  supabaseConfigured: boolean;
};

type Mode = "login" | "signup";

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

type SignUpFormState = {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
};

const initialSignupState: SignUpFormState = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  phone: "",
};

export default function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimeout = useRef<number | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupForm, setSignupForm] = useState<SignUpFormState>(initialSignupState);

  const supabase = useMemo<SupabaseClient<Database> | null>(() => {
    if (!supabaseConfigured) {
      return null;
    }

    return getSupabaseBrowserClient();
  }, [supabaseConfigured]);

  const { handleRoleRedirect, isCheckingRole } = useRoleRedirect({
    supabase,
    enabled: Boolean(supabase),
    onRedirectStart: () => setIsRedirecting(true),
    onRedirectEnd: () => setIsRedirecting(false),
  });

  useEffect(() => {
    setStatus(null);
  }, [mode]);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const scheduleRedirect = (path: string, delay = 400) => {
    if (redirectTimeout.current) {
      window.clearTimeout(redirectTimeout.current);
    }

    redirectTimeout.current = window.setTimeout(() => {
      setIsRedirecting(true);
      router.push(path);
    }, delay);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setStatus({
        type: "error",
        message: "Please provide both your email address and password to continue.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    if (!supabase) {
      console.log("Mock login payload", { email: trimmedEmail });
      await new Promise((resolve) => setTimeout(resolve, 700));
      setIsSubmitting(false);
      setStatus({ type: "success", message: "Signed in! Preparing your dashboard…" });
      scheduleRedirect("/client", 500);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Signed in successfully. Redirecting you now…",
    });

    void handleRoleRedirect(data.session, "password sign-in");
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = loginEmail.trim();

    if (!trimmedEmail) {
      setStatus({
        type: "error",
        message: "Enter the email tied to your account so we can help you reset your password.",
      });
      return;
    }

    setIsSendingResetEmail(true);
    setStatus(null);

    if (!supabase) {
      console.log("Mock password reset payload", { email: trimmedEmail });
      await new Promise((resolve) => setTimeout(resolve, 700));
      setIsSendingResetEmail(false);
      setStatus({
        type: "success",
        message: "Check your inbox for the password reset link.",
      });
      return;
    }

    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${origin}/login`,
    });

    setIsSendingResetEmail(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "We’ve sent a reset link to your email. Follow the instructions to update your password.",
    });
  };

  const handleSignupChange = (field: keyof SignUpFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSignupForm((previous) => ({ ...previous, [field]: value }));
    };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValues = {
      firstName: signupForm.firstName.trim(),
      lastName: signupForm.lastName.trim(),
      businessName: signupForm.businessName.trim(),
      email: signupForm.email.trim(),
      phone: signupForm.phone.trim(),
    } as const;

    if (Object.values(trimmedValues).some((value) => !value)) {
      setStatus({
        type: "error",
        message: "Complete every field so your mentor can confirm your access.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    if (!supabase) {
      console.log("Mock signup payload", trimmedValues);
      await new Promise((resolve) => setTimeout(resolve, 900));
      setIsSubmitting(false);
      setSignupForm(initialSignupState);
      setStatus({
        type: "success",
        message: "Account created! Redirecting you to the dashboard.",
      });
      scheduleRedirect("/client");
      return;
    }

    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/client`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setSignupForm(initialSignupState);
    setStatus({ type: "success", message: "Account created! Redirecting you to the dashboard." });

    scheduleRedirect("/client");
  };

  const switchTo = (nextMode: Mode) => {
    if (mode === nextMode || isSubmitting) {
      return;
    }

    setMode(nextMode);
  };

  const renderStatusIcon = () => {
    if (!status) {
      return null;
    }

    if (status.type === "success") {
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M7.8 13.4 4.7 10.3a1 1 0 0 1 1.4-1.4l2 2 5-5a1 1 0 0 1 1.4 1.4l-5.7 5.7a1 1 0 0 1-1.4 0Z"
            fill="currentColor"
          />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9 5h2l-.5 7h-1Z" fill="currentColor" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </svg>
    );
  };

  const isRoleRedirecting = isRedirecting || isCheckingRole;

  return (
    <section className="form-shell" aria-live="polite">
      <header>
        <h2>{mode === "login" ? "Welcome Back" : "Create Your Account"}</h2>
        <p>
          {mode === "login"
            ? "Access the Business Revenue Model command center and sync with your mentor in moments."
            : "Share a few details so your Triumph mentor can unlock the platform for you."}
        </p>
      </header>

      <div className="form-panels">
        <form
          className={`form-panel form-panel--login ${mode === "login" ? "is-active" : ""}`}
          onSubmit={handleLoginSubmit}
          aria-hidden={mode !== "login"}
        >
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <div className="input-shell">
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@triumph.com"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="input-shell">
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <button
            type="button"
            className="form-secondary-link"
            onClick={handleForgotPassword}
            disabled={isSubmitting || isSendingResetEmail || isRoleRedirecting}
          >
            {isSendingResetEmail ? "Sending reset link…" : "Forgot password?"}
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting || isSendingResetEmail || isRoleRedirecting}
          >
            {isSubmitting ? "Signing In" : "Sign In"}
          </button>

          <p className="form-link">
            Don’t have an account?
            <button type="button" onClick={() => switchTo("signup")}>
              Sign Up
            </button>
          </p>
        </form>

        <form
          className={`form-panel form-panel--signup ${mode === "signup" ? "is-active" : ""}`}
          onSubmit={handleSignupSubmit}
          aria-hidden={mode !== "signup"}
        >
          <div className="field">
            <label htmlFor="signup-firstName">First Name</label>
            <div className="input-shell">
              <input
                id="signup-firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Jordan"
                value={signupForm.firstName}
                onChange={handleSignupChange("firstName")}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="signup-lastName">Last Name</label>
            <div className="input-shell">
              <input
                id="signup-lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Rivera"
                value={signupForm.lastName}
                onChange={handleSignupChange("lastName")}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="signup-businessName">Business Name</label>
            <div className="input-shell">
              <input
                id="signup-businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                placeholder="Triumph Studios"
                value={signupForm.businessName}
                onChange={handleSignupChange("businessName")}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="signup-email">Email</label>
            <div className="input-shell">
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="hello@business.com"
                value={signupForm.email}
                onChange={handleSignupChange("email")}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="signup-phone">Phone Number</label>
            <div className="input-shell">
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 123-4567"
                value={signupForm.phone}
                onChange={handleSignupChange("phone")}
                disabled={isSubmitting || isRoleRedirecting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting || isRoleRedirecting}
          >
            {isSubmitting ? "Submitting" : "Register"}
          </button>

          <p className="form-link">
            Already have an account?
            <button type="button" onClick={() => switchTo("login")}>
              Sign In
            </button>
          </p>
        </form>
      </div>

      {status && (
        <div
          className={`status-banner ${status.type}`}
          role={status.type === "error" ? "alert" : "status"}
        >
          {renderStatusIcon()}
          <span>{status.message}</span>
        </div>
      )}

      {!supabaseConfigured && (
        <p className="supabase-warning">
          Authentication isn’t wired up yet. Replace the mock handlers with your API calls once Supabase credentials are in place.
        </p>
      )}

      {isRoleRedirecting && (
        <div className="redirecting-chip" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="spin-icon">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
            <path
              d="M12 2a10 10 0 0 1 9.54 7.09l-2.38.7A7.5 7.5 0 0 0 12 4.5V2Z"
              fill="currentColor"
            />
          </svg>
          Redirecting…
        </div>
      )}
    </section>
  );
}
