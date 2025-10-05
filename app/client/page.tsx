import type { Metadata } from "next";
import BusinessProfileForm from "./BusinessProfileForm";

export const metadata: Metadata = {
  title: "Client Dashboard | TBS BRM App",
};

export default function ClientDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-base leading-relaxed text-slate-600">
            This dashboard keeps your Triumph mentor aligned with where your business is today and where you&#39;re headed next. Keep your profile fresh so our program resources stay tailored to your goals.
          </p>
        </header>

        <BusinessProfileForm />
      </div>
    </main>
  );
}
