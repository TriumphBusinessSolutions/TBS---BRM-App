import type { Metadata } from "next";

import "../login/login.css";
import RegisterHero from "./RegisterHero";

export const metadata: Metadata = {
  title: "Create your account | Business Revenue Model App",
};

export default function RegisterPage() {
  return (
    <div className="login-scene">
      <div className="login-particles" aria-hidden="true" />
      <RegisterHero />
    </div>
  );
}
