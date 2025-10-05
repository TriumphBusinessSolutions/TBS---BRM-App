import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in | TBS BRM App",
};

const googleProviders = process.env.NEXT_PUBLIC_SUPABASE_OAUTH_PROVIDERS;
const isGoogleEnabled = googleProviders
  ? googleProviders
      .split(",")
      .map((provider) => provider.trim().toLowerCase())
      .includes("google")
  : true;

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#004aad] px-4 py-12 text-[#0f1626]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,145,0,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(0,74,173,0.65),_rgba(2,18,53,0.95))]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),rgba(0,0,0,0.05))] mix-blend-overlay" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10">
        <div className="relative w-full max-w-xl">
          <div className="absolute -inset-1 rounded-[32px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(250,145,0,0.6),rgba(0,74,173,0.8),rgba(250,145,0,0.6))] opacity-80 blur-2xl" />

          <div className="relative rounded-[32px] bg-white/95 p-10 shadow-[0_45px_90px_-30px_rgba(6,24,44,0.65)] ring-1 ring-white/40 backdrop-blur">
            <div className="mb-8 flex items-start gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fa9100] via-[#ffbb58] to-[#004aad] shadow-[0_18px_35px_rgba(250,145,0,0.45)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="h-11 w-11 text-white"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M32 6c-11.598 0-21 9.402-21 21 0 6.265 2.755 12.085 7.57 16.031-.694 5.31-2.867 8.988-4.766 11.061a2 2 0 0 0 1.335 3.388c6.978.35 12.71-2.692 16.483-5.301 3.773 2.61 9.505 5.651 16.482 5.3a2 2 0 0 0 1.336-3.386c-1.901-2.075-4.077-5.759-4.77-11.079C50.244 39.085 53 33.265 53 27c0-11.598-9.402-21-21-21Zm0 6c8.271 0 15 6.729 15 15 0 4.672-2.133 8.94-5.852 11.802a2 2 0 0 0-.765 1.863c.536 3.983 1.682 7.153 2.968 9.689-4.307-.756-7.91-2.95-10.35-4.761a2 2 0 0 0-2.002-.139A22.86 22.86 0 0 1 24.7 50.35c1.286-2.536 2.432-5.707 2.968-9.69a2 2 0 0 0-.763-1.862C19.187 35.939 17 31.672 17 27c0-8.271 6.729-15 15-15Zm0 8c-3.86 0-7 3.14-7 7 0 2.94 1.87 5.48 4.513 6.52a2 2 0 0 0 1.073 3.817h2.829a2 2 0 0 0 1.074-3.817C37.129 32.48 39 29.94 39 27c0-3.86-3.14-7-7-7Z"
                  />
                </svg>
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#fa9100]">
                  Triumph Business Solutions
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-[#0f1626]">
                  Welcome back to the BRM App
                </h1>
                <p className="mt-2 max-w-md text-sm text-[#415170]">
                  Securely access your Business Revenue Models workspace and pick up where you left off.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#004aad]/10 bg-white/90 p-2 shadow-inner">
              <LoginForm
                googleAvailable={isGoogleEnabled}
                supabaseConfigured={supabaseConfigured}
              />
            </div>
          </div>
        </div>

        <p className="text-sm font-medium tracking-wide text-white/80">
          Powered by Triumph Business Solutions
        </p>
      </div>
    </div>
  );
}
