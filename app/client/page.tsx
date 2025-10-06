import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import BusinessProfileForm from "./BusinessProfileForm";
import ModelPanel, {
  type KpiRow,
  type MilestoneRow,
  type ModelRow,
} from "./components/ModelPanel";
import { getSupabaseClient } from "../../lib/supabase";

export const metadata: Metadata = {
  title: "Client Dashboard | TBS BRM App",
};

type ClientRow = {
  id: string;
  name: string;
  business_information_completed_at?: string | null;
};

function Layout({
  children,
  showBusinessProfileForm,
}: {
  children?: ReactNode;
  showBusinessProfileForm: boolean;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-base leading-relaxed text-slate-600">
              This dashboard keeps your Triumph mentor aligned with where your business is today and where you’re headed next.
              Keep your profile fresh so our program resources stay tailored to your goals.
            </p>
          </div>
          <Link
            href="/client/settings"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h3l.879 1.758a2 2 0 0 0 1.341 1.077l1.903.475-1.365 2.047a2 2 0 0 0 0 2.286l1.365 2.047-1.903.475a2 2 0 0 0-1.341 1.077L13.5 18h-3l-.879-1.758a2 2 0 0 0-1.341-1.077l-1.903-.475 1.365-2.047a2 2 0 0 0 0-2.286L7.377 9.31l1.903-.475a2 2 0 0 0 1.341-1.077L10.5 6Z"
              />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Settings
          </Link>
        </header>

        {showBusinessProfileForm ? <BusinessProfileForm /> : null}

        {children}
      </div>
    </main>
  );
}

function groupByModel<T extends { model_id: string }>(rows: T[]) {
  const map = new Map<string, T[]>();
  rows.forEach((row) => {
    const bucket = map.get(row.model_id) ?? [];
    bucket.push(row);
    map.set(row.model_id, bucket);
  });
  return map;
}

function renderErrors(errors: string[]) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm">
      <p className="font-semibold">There was a problem loading client data.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

const overviewHeader = (
  <div className="space-y-2">
    <h2 className="text-xl font-semibold tracking-tight text-slate-900">My BRM Progress</h2>
    <p className="text-sm text-slate-600">
      Snapshot of models, milestones, and KPIs aligned to your current Triumph plan.
    </p>
  </div>
);

function BusinessInformationPrompt({ href }: { href: string }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h3 className="text-lg font-semibold">Complete your business information</h3>
      <p className="mt-2 text-sm">
        Tell us about your business so we can tailor your BRM roadmap and surface the most relevant
        models, milestones, and KPIs for you.
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        Fill out the Business Information form
      </Link>
    </section>
  );
}

export default async function ClientDashboardPage() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const errors = [
      "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    ];

    return (
      <Layout showBusinessProfileForm>
        {renderErrors(errors)}
        <p className="text-sm text-slate-500">
          Unable to load client data because Supabase environment variables are missing.
        </p>
      </Layout>
    );
  }

  const errors: string[] = [];
  let businessInfoFieldAvailable = true;

  const initialClientResult = await supabase
    .from("clients")
    .select("id,name,business_information_completed_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<ClientRow>();

  let client = initialClientResult.data;

  if (initialClientResult.error) {
    if (initialClientResult.error.code === "42703") {
      businessInfoFieldAvailable = false;
      const fallbackClientResult = await supabase
        .from("clients")
        .select("id,name")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle<ClientRow>();

      if (fallbackClientResult.error) {
        errors.push(fallbackClientResult.error.message);
      }

      client = fallbackClientResult.data;
    } else {
      errors.push(initialClientResult.error.message);
    }
  }

  if (!client) {
    return (
      <Layout showBusinessProfileForm>
        {renderErrors(errors)}
        <p className="text-sm text-slate-500">No client found.</p>
      </Layout>
    );
  }

  const [modelsRes, milestonesRes, kpisRes] = await Promise.all([
    supabase
      .from("models")
      .select("id,client_id,level,status")
      .eq("client_id", client.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("milestones")
      .select("id,model_id,title,done")
      .order("created_at", { ascending: true }),
    supabase
      .from("kpis")
      .select("id,model_id,key,target,value,period")
      .order("period", { ascending: true }),
  ]);

  if (modelsRes.error) {
    errors.push(modelsRes.error.message);
  }
  if (milestonesRes.error) {
    errors.push(milestonesRes.error.message);
  }
  if (kpisRes.error) {
    errors.push(kpisRes.error.message);
  }

  const models = (modelsRes.data ?? []) as ModelRow[];
  const modelIds = new Set(models.map((model) => model.id));
  const milestones = ((milestonesRes.data ?? []) as MilestoneRow[]).filter((milestone) =>
    modelIds.has(milestone.model_id),
  );
  const kpis = ((kpisRes.data ?? []) as KpiRow[]).filter((kpi) => modelIds.has(kpi.model_id));

  const milestonesByModel = groupByModel(milestones);
  const kpisByModel = groupByModel(kpis);

  const showBusinessInformationPrompt =
    businessInfoFieldAvailable && client.business_information_completed_at == null;
  const businessInformationFormHref = "/client/settings";

  const showBusinessProfileForm =
    businessInfoFieldAvailable && client.business_information_completed_at == null;

  return (
    <Layout showBusinessProfileForm={showBusinessProfileForm}>
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {overviewHeader}
            <div className="text-sm text-slate-500">
              Client: <span className="font-medium text-slate-900">{client.name}</span>
            </div>
          </div>

          {renderErrors(errors)}

          {showBusinessInformationPrompt ? (
            <BusinessInformationPrompt href={businessInformationFormHref} />
          ) : null}

          {models.length === 0 ? (
            <p className="text-sm text-slate-500">
              {showBusinessInformationPrompt
                ? "We’ll populate your BRM plan after you complete the Business Information form."
                : "No models yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <ModelPanel
                  key={model.id}
                  model={model}
                  milestones={milestonesByModel.get(model.id) ?? []}
                  kpis={kpisByModel.get(model.id) ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
