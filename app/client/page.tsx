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
  const introTitle = showBusinessProfileForm ? "Let's get your business ready" : "Welcome back";
  const introSubtitle = showBusinessProfileForm
    ? "Complete your business information so we can tailor your Triumph BRM journey to the goals that matter most."
    : "This dashboard keeps your Triumph mentor aligned with where your business is today and where you’re headed next. Keep your profile fresh so our program resources stay tailored to your goals.";
  const nextStepTitle = showBusinessProfileForm ? "Complete your business profile" : "Share your latest updates";
  const nextStepDescription = showBusinessProfileForm
    ? "A filled-in profile unlocks personalized models, KPIs, and mentor prompts for your launch."
    : "Refreshing your details keeps Triumph mentors focused on the momentum that matters most.";

  const quickStats = [
    {
      title: "Profile status",
      value: showBusinessProfileForm ? "Setup needed" : "Profile synced",
      description: showBusinessProfileForm
        ? "Add your business foundations so we can personalize your roadmap."
        : "Your mentor is working with your latest snapshot—keep it rolling!",
      tint: "bg-[#fa9100]/35",
    },
    {
      title: "Mentor alignment",
      value: showBusinessProfileForm ? "Kickoff pending" : "Active guidance",
      description: showBusinessProfileForm
        ? "Finish onboarding to activate Triumph mentor support."
        : "Expect proactive nudges and resources tuned to your journey.",
      tint: "bg-[#004aad]/40",
    },
    {
      title: "Workspace focus",
      value: showBusinessProfileForm ? "Start with Business Profile" : "Review models weekly",
      description: showBusinessProfileForm
        ? "Set the tone for your BRM workspace by sharing your core offers."
        : "Celebrate progress, adjust KPIs, and plan the next momentum markers.",
      tint: "bg-[#8fd6ff]/40",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 bg-[#004aad]/35 blur-[160px]" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[520px] w-[520px] bg-[#fa9100]/25 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(143,214,255,0.12),_transparent_65%)]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 lg:px-6">
        <header className="relative overflow-hidden rounded-[40px] border border-white/15 bg-white/5 px-8 py-12 shadow-[0_60px_160px_rgba(1,9,30,0.55)] backdrop-blur-xl md:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#fa9100]/35 blur-[120px]" />
            <div className="absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full bg-[#004aad]/40 blur-[140px]" />
          </div>
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/80">
                Triumph client workspace
              </span>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold md:text-4xl">{introTitle}</h1>
                <p className="text-base leading-relaxed text-slate-200/80">{introSubtitle}</p>
              </div>
              <ul className="grid gap-3 text-sm text-slate-200/90 sm:grid-cols-2">
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_60px_rgba(2,10,36,0.4)]">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#fa9100]" aria-hidden />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-100">Guided growth checkpoints</p>
                    <p className="text-xs text-slate-300/90">Follow curated milestones co-created with Triumph mentors.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_60px_rgba(2,10,36,0.4)]">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#8fd6ff]" aria-hidden />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-100">Revenue clarity at a glance</p>
                    <p className="text-xs text-slate-300/90">Track KPIs, services, and wins without leaving your workspace.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-4 text-sm lg:w-auto">
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-left text-slate-100 shadow-[0_25px_80px_rgba(2,10,36,0.45)]">
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">Next step</p>
                <p className="mt-2 text-base font-semibold text-white">{nextStepTitle}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-200/80">{nextStepDescription}</p>
              </div>
              <Link
                href="/client/settings"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#fa9100] via-[#ffb341] to-[#8fd6ff] px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_25px_70px_rgba(250,145,0,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Manage account settings
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {quickStats.map((stat) => (
            <article
              key={stat.title}
              className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm shadow-[0_35px_120px_rgba(1,9,30,0.4)] backdrop-blur"
            >
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className={`absolute -top-10 right-0 h-36 w-36 rounded-full ${stat.tint} blur-3xl`} />
              </div>
              <div className="relative space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{stat.title}</p>
                <p className="text-2xl font-semibold text-slate-100">{stat.value}</p>
                <p className="text-xs text-slate-300/90">{stat.description}</p>
              </div>
            </article>
          ))}
        </section>

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
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100 shadow-[0_20px_60px_rgba(112,26,67,0.45)]">
      <p className="font-semibold text-rose-50">There was a problem loading client data.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-rose-100/90">
        {errors.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

const overviewHeader = (
  <div className="space-y-2">
    <h2 className="text-xl font-semibold tracking-tight text-slate-50">My BRM Progress</h2>
    <p className="text-sm text-slate-300/90">
      Snapshot of models, milestones, and KPIs aligned to your current Triumph plan.
    </p>
  </div>
);

function BusinessInformationPrompt({ href }: { href: string }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 text-slate-100 shadow-[0_35px_120px_rgba(1,9,30,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-14 right-0 h-44 w-44 rounded-full bg-[#fa9100]/30 blur-[120px]" />
        <div className="absolute bottom-[-6rem] left-[-3rem] h-60 w-60 rounded-full bg-[#004aad]/35 blur-[140px]" />
      </div>
      <div className="relative space-y-4">
        <h3 className="text-lg font-semibold text-slate-50">Complete your business information</h3>
        <p className="text-sm leading-relaxed text-slate-200/80">
          Tell us about your business so we can tailor your BRM roadmap and surface the most relevant models, milestones, and KPIs for you.
        </p>
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#fa9100] via-[#ffb341] to-[#8fd6ff] px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_25px_70px_rgba(250,145,0,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Fill out the Business Information form
        </Link>
      </div>
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
        <p className="text-sm text-slate-300/80">
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
        <p className="text-sm text-slate-300/80">No client found.</p>
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

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((milestone) => milestone.done).length;
  const milestoneCompletion =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const upcomingMilestones = milestones.filter((milestone) => !milestone.done).length;
  const trackedKpis = kpis.filter((kpi) => kpi.target != null || kpi.value != null);
  const onTrackKpis = trackedKpis.filter(
    (kpi) => kpi.target != null && kpi.value != null && Number(kpi.value) >= Number(kpi.target),
  ).length;

  const summaryCards = [
    {
      title: "Models in motion",
      value: models.length,
      description: "Active BRM pillars guiding your progress right now.",
      tint: "bg-[#fa9100]/35",
    },
    {
      title: "Milestone completion",
      value: `${milestoneCompletion}%`,
      description: `${completedMilestones} of ${totalMilestones || 0} steps complete across all models.`,
      tint: "bg-[#8fd6ff]/35",
    },
    {
      title: "Upcoming milestones",
      value: upcomingMilestones,
      description: "Keep momentum by closing out these next high-impact tasks.",
      tint: "bg-[#004aad]/35",
    },
    {
      title: "KPIs with targets",
      value: trackedKpis.length,
      description: `${onTrackKpis} currently meeting or exceeding goals.`,
      tint: "bg-[#ffb341]/35",
    },
  ];

  const showBusinessInformationPrompt =
    businessInfoFieldAvailable && client.business_information_completed_at == null;
  const businessInformationFormHref = "/client/settings";

  const showBusinessProfileForm =
    businessInfoFieldAvailable && client.business_information_completed_at == null;

  return (
    <Layout showBusinessProfileForm={showBusinessProfileForm}>
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_45px_140px_rgba(1,9,30,0.45)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#8fd6ff]/25 blur-[140px]" />
          <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-[#004aad]/35 blur-[160px]" />
        </div>
        <div className="relative flex flex-col gap-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {overviewHeader}
            <div className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-slate-200/80 shadow-[0_18px_60px_rgba(2,10,36,0.45)]">
              Client: <span className="font-semibold text-white">{client.name}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm shadow-[0_30px_110px_rgba(1,9,30,0.4)] transition hover:border-white/20"
              >
                <div className="pointer-events-none absolute inset-0 opacity-70">
                  <div className={`absolute -top-10 right-0 h-32 w-32 rounded-full ${card.tint} blur-3xl`} />
                </div>
                <div className="relative space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{card.title}</p>
                  <p className="text-3xl font-semibold text-slate-100">{card.value}</p>
                  <p className="text-sm text-slate-300/90">{card.description}</p>
                </div>
              </article>
            ))}
          </div>

          {renderErrors(errors)}

          {showBusinessInformationPrompt ? (
            <BusinessInformationPrompt href={businessInformationFormHref} />
          ) : null}

          {models.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-slate-300/90 shadow-[0_30px_110px_rgba(1,9,30,0.4)]">
              <p className="font-medium text-slate-100">You&apos;re all set to begin.</p>
              <p className="mt-2 text-slate-300/80">
                {showBusinessInformationPrompt
                  ? "We’ll populate your BRM plan after you complete the Business Information form."
                  : "Add your first model to start tracking milestones and KPIs."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
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
