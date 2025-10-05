import type { Metadata } from "next";

import "../login/login.css";

export const metadata: Metadata = {
  title: "Dashboard | Business Revenue Model App",
};

export default function DashboardPage() {
  return (
    <div className="login-scene" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="login-particles" aria-hidden="true" />
      <main className="login-stage" style={{ textAlign: "center", maxWidth: "640px" }}>
        <div className="brand-header">
          <h1 className="brand-title">Welcome aboard!</h1>
          <p className="brand-description">
            Thanks for signing up! Once your account is confirmed for access, you’ll be able to get started.
          </p>
        </div>
      </main>
    </div>
  );
}
