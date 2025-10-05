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
import Link from "next/link";

import ModelPanel, {
  type KpiRow,
  type MilestoneRow,
  type ModelRow,
} from "./components/ModelPanel";
import { getSupabaseClient } from "../../lib/supabase";

type ClientRow = {
  id: string;
  name: string;
  business_information_completed_at?: string | null;
};

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
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-semibold">There was a problem loading client data.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

const header = (
  <header className="space-y-2">
    <h1 className="text-2xl font-bold tracking-tight">Client — My BRM View</h1>
    <p className="text-sm text-slate-600">
      Overview of your BRM progress, milestones, and KPIs.
    </p>
  </header>
);

function BusinessInformationPrompt({ href }: { href: string }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-lg font-semibold">Complete your business information</h2>
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
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {header}
        {renderErrors(errors)}
        <p className="text-sm text-slate-500">
          Unable to load client data because Supabase environment variables are missing.
        </p>
      </main>
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
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {header}
        {renderErrors(errors)}
        <p className="text-sm text-slate-500">No client found.</p>
      </main>
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
    modelIds.has(milestone.model_id)
  );
  const kpis = ((kpisRes.data ?? []) as KpiRow[]).filter((kpi) => modelIds.has(kpi.model_id));

  const milestonesByModel = groupByModel(milestones);
  const kpisByModel = groupByModel(kpis);

  const showBusinessInformationPrompt =
    businessInfoFieldAvailable && client.business_information_completed_at == null;
  const businessInformationFormHref = "/client/business-information";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      {header}
      {renderErrors(errors)}

      {showBusinessInformationPrompt ? (
        <BusinessInformationPrompt href={businessInformationFormHref} />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Client: {client.name}</h2>

        {models.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            {showBusinessInformationPrompt
              ? "We’ll populate your BRM plan after you complete the Business Information form."
              : "No models yet."}
          </p>
        ) : (
          <div className="mt-6 space-y-4">
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
      </section>
    </main>
  );
}
