import type { Metadata } from "next";

import "./login.css";
import LoginHero from "./LoginHero";

export const metadata: Metadata = {
  title: "Sign in | Business Revenue Model App",
};

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  return (
    <div className="login-scene">
      <div className="login-particles" aria-hidden="true" />
      <LoginHero supabaseConfigured={supabaseConfigured} />
    </div>
  );
}
