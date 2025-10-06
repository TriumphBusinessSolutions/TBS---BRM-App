import type { Metadata } from "next";
import Link from "next/link";

import BusinessProfileForm from "./BusinessProfileForm";
import ModelPanel, {
  type KpiRow,
  type MilestoneRow,
  type ModelRow,
} from "./components/ModelPanel";
import ClientShell from "./components/ClientShell";
import { getSupabaseClient } from "../../lib/supabase";

export const metadata: Metadata = {
  title: "Client Dashboard | TBS BRM App",
};

type ClientRow = {
  id: string;
  name: string;
  business_information_completed_at?: string | null;
};

const sectionCardClasses =
  "relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_45px_140px_rgba(1,9,30,0.45)] backdrop-blur";

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

function BusinessInformationPrompt({ href }: { href: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-slate-100 shadow-[0_25px_90px_rgba(1,9,30,0.4)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-16 right-0 h-44 w-44 rounded-full bg-[#fa9100]/25 blur-[120px]" />
        <div className="absolute bottom-[-5rem] left-[-3rem] h-52 w-52 rounded-full bg-[#004aad]/30 blur-[140px]" />
      </div>
      <div className="relative space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Business profile</p>
        <h3 className="text-lg font-semibold text-slate-50">Complete your business information</h3>
        <p className="text-sm leading-relaxed text-slate-200/80">
          Share your core offers, audience, and program details so your Triumph mentor can personalize every checkpoint.
        </p>
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#fa9100] via-[#ffb341] to-[#8fd6ff] px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_25px_70px_rgba(250,145,0,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
        >
          Go to settings
        </Link>
      </div>
    </div>
  );
}

export default async function ClientDashboardPage() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const errors = [
      "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    ];

    return (
      <ClientShell>
        <section className={`${sectionCardClasses} px-8 py-10`}>
          <div className="space-y-4">
            {renderErrors(errors)}
            <p className="text-sm text-slate-300/80">
              Unable to load client data because Supabase environment variables are missing.
            </p>
          </div>
        </section>
      </ClientShell>
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
      <ClientShell>
        <section className={`${sectionCardClasses} px-8 py-10`}>
          <div className="space-y-4">
            {renderErrors(errors)}
            <p className="text-sm text-slate-300/80">No client found.</p>
          </div>
        </section>
      </ClientShell>
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
        : "Celebrate wins, adjust KPIs, and plan the next momentum markers.",
      tint: "bg-[#8fd6ff]/40",
    },
  ];

  return (
    <ClientShell>
      <section className={`${sectionCardClasses} px-8 py-12 md:px-12`}>
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#fa9100]/30 blur-[140px]" />
          <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-[#004aad]/40 blur-[160px]" />
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
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 text-left text-slate-200 shadow-[0_25px_80px_rgba(2,10,36,0.45)]">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Client</p>
              <p className="mt-2 text-base font-semibold text-white">{client.name}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${sectionCardClasses} px-8 py-10`}>
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-20 left-0 h-60 w-60 rounded-full bg-[#8fd6ff]/30 blur-[140px]" />
        </div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Workspace snapshot</p>
              <h2 className="text-xl font-semibold text-slate-50">Your current status</h2>
            </div>
            <p className="max-w-sm text-sm text-slate-300/80">
              Glance at the health of your onboarding, mentor alignment, and weekly focus to stay on track.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickStats.map((stat) => (
              <article
                key={stat.title}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-sm shadow-[0_35px_120px_rgba(1,9,30,0.4)]"
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
          </div>
        </div>
      </section>

      {showBusinessProfileForm ? (
        <BusinessProfileForm />
      ) : (
        <section className={`${sectionCardClasses} px-8 py-10`}>
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -top-16 right-0 h-56 w-56 rounded-full bg-[#fa9100]/25 blur-[140px]" />
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Business profile</p>
              <h2 className="text-2xl font-semibold text-slate-50">Your mentor has the latest details</h2>
              <p className="text-sm leading-relaxed text-slate-300/85">
                Keep momentum by refreshing your services, goals, and program notes whenever things shift. Updates save instantly for your Triumph mentor.
              </p>
            </div>
            <Link
              href="/client/settings"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Review profile in settings
            </Link>
          </div>
        </section>
      )}

      <section className={`${sectionCardClasses} px-8 py-10`}>
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-20 left-[-4rem] h-64 w-64 rounded-full bg-[#004aad]/35 blur-[160px]" />
          <div className="absolute bottom-[-6rem] right-[-3rem] h-60 w-60 rounded-full bg-[#fa9100]/30 blur-[140px]" />
        </div>
        <div className="relative space-y-8">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Program progress</p>
              <h2 className="text-2xl font-semibold text-slate-50">Growth models overview</h2>
            </div>
            <p className="max-w-md text-sm text-slate-300/80">
              Track how each model is advancing so you and your Triumph mentor can prioritize the milestones that unlock the biggest wins.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article
                key={card.title}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 text-sm shadow-[0_30px_110px_rgba(1,9,30,0.4)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-70">
                  <div className={`absolute -top-10 right-0 h-32 w-32 rounded-full ${card.tint} blur-3xl`} />
                </div>
                <div className="relative space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{card.title}</p>
                  <p className="text-3xl font-semibold text-slate-100">{card.value}</p>
                  <p className="text-xs text-slate-300/90">{card.description}</p>
                </div>
              </article>
            ))}
          </div>

          {renderErrors(errors)}

          {showBusinessInformationPrompt ? (
            <BusinessInformationPrompt href={businessInformationFormHref} />
          ) : null}

          {models.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-slate-300/90 shadow-[0_30px_110px_rgba(1,9,30,0.4)]">
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
    </ClientShell>
  );
}
