import Link from "next/link";
import type { Metadata } from "next";

import BusinessProfileForm from "../BusinessProfileForm";

export const metadata: Metadata = {
  title: "Client Settings | TBS BRM App",
};

export default function ClientSettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Client settings</h1>
            <p className="mt-2 text-sm text-slate-600">
              Update your business information so your Triumph mentor always has the latest context.
            </p>
          </div>
          <Link
            href="/client"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Back to dashboard
          </Link>
        </header>

        <BusinessProfileForm />
      </div>
    </main>
  );
}
