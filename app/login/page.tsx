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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <LoginForm
        googleAvailable={isGoogleEnabled}
        supabaseConfigured={supabaseConfigured}
      />
    </div>
  );
}
