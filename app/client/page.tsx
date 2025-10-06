import type { Metadata } from "next";

import BusinessProfileForm from "./BusinessProfileForm";
import ClientShell from "./components/ClientShell";
import DashboardCard from "./components/DashboardCard";
import ErrorFallback from "./components/ErrorFallback";
import ModelPanel, {
  type KpiRow,
  type MilestoneRow,
  type ModelRow,
} from "./components/ModelPanel";
import PageLayout from "./components/PageLayout";
import { getSupabaseClient } from "../../lib/supabase";
import styles from "./page.module.css";
import cardStyles from "./components/DashboardCard.module.css";
import { HomeIcon, LayersIcon, SparkleIcon, UsersIcon } from "./components/icons";

export const metadata: Metadata = {
  title: "Client Dashboard | TBS BRM App",
};

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

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Something went wrong while contacting the Triumph service.";
}

function normalizeErrorMessage(message: string) {
  if (message.toLowerCase().includes("fetch failed")) {
    return "We couldn’t reach the Triumph data service. Please refresh or try again shortly.";
  }
  return message;
}

function normalizeErrors(errors: string[]) {
  return errors.map(normalizeErrorMessage);
}

export default async function ClientDashboardPage() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const errors = normalizeErrors([
      "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    ]);

    return (
      <ClientShell activePath="/client">
        <PageLayout
          id="home"
          eyebrow="Triumph workspace"
          title="We need a quick configuration update"
          description="Your dashboard depends on the Supabase connection. Update the environment variables to unlock your personalized view."
        >
          <ErrorFallback messages={errors} />
        </PageLayout>
      </ClientShell>
    );
  }

  const errors: string[] = [];
  let businessInfoFieldAvailable = true;

  let initialClientResult: any = { data: null, error: null };
  try {
    initialClientResult = await supabase
      .from("clients")
      .select("id,name,business_information_completed_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<ClientRow>();
  } catch (error) {
    errors.push(toErrorMessage(error));
  }

  let client = initialClientResult.data as ClientRow | null;

  if (initialClientResult.error) {
    if (initialClientResult.error.code === "42703") {
      businessInfoFieldAvailable = false;
      try {
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
      } catch (error) {
        errors.push(toErrorMessage(error));
      }
    } else {
      errors.push(initialClientResult.error.message);
    }
  }

  if (!client) {
    return (
      <ClientShell activePath="/client">
        <PageLayout
          id="home"
          eyebrow="Triumph workspace"
          title="We couldn’t find an active client profile"
          description="Create a client record to unlock growth models, KPIs, and mentor collaboration."
        >
          <ErrorFallback messages={normalizeErrors(errors)} />
        </PageLayout>
      </ClientShell>
    );
  }

  let modelsRes: any = { data: [], error: null };
  let milestonesRes: any = { data: [], error: null };
  let kpisRes: any = { data: [], error: null };

  try {
    [modelsRes, milestonesRes, kpisRes] = await Promise.all([
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
  } catch (error) {
    errors.push(toErrorMessage(error));
  }

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
  const modelIds = new Set(models.map((model: ModelRow) => model.id));
  const milestones = ((milestonesRes.data ?? []) as MilestoneRow[]).filter((milestone) => modelIds.has(milestone.model_id));
  const kpis = ((kpisRes.data ?? []) as KpiRow[]).filter((kpi) => modelIds.has(kpi.model_id));

  const milestonesByModel = groupByModel(milestones);
  const kpisByModel = groupByModel(kpis);

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((milestone) => milestone.done).length;
  const milestoneCompletion = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const upcomingMilestones = milestones.filter((milestone) => !milestone.done).length;
  const trackedKpis = kpis.filter((kpi) => kpi.target != null || kpi.value != null);
  const onTrackKpis = trackedKpis.filter(
    (kpi) => kpi.target != null && kpi.value != null && Number(kpi.value) >= Number(kpi.target),
  ).length;

  const showBusinessInformationPrompt =
    businessInfoFieldAvailable && client.business_information_completed_at == null;
  const businessInformationFormHref = "/client/settings";
  const introTitle = showBusinessInformationPrompt ? "Let’s get your business ready" : "Welcome back";
  const introSubtitle = showBusinessInformationPrompt
    ? "Complete your business information so we can tailor your Triumph BRM journey to the goals that matter most."
    : "This dashboard keeps your Triumph mentor aligned with where your business is today and where you’re headed next. Keep your profile fresh so our program resources stay tuned to your goals.";

  const mentorHighlights = [
    {
      title: "Message your mentor",
      description: "Email mentor@triumph.com with updates or wins between sessions.",
      href: "mailto:mentor@triumph.com",
    },
    {
      title: "Schedule your next sync",
      description: "Book time to review progress, unblock milestones, and plan the week ahead.",
      href: "#",
    },
    {
      title: "Share weekly recap",
      description: "Drop key outcomes and blockers in the shared Triumph workspace notes.",
      href: "#",
    },
  ];

  const quickStats = [
    {
      label: "Profile status",
      value: showBusinessInformationPrompt ? "Setup needed" : "Profile synced",
      description: showBusinessInformationPrompt
        ? "Add your business foundations so we can personalize your roadmap."
        : "Your mentor is working with your latest snapshot—keep it rolling!",
    },
    {
      label: "Mentor alignment",
      value: showBusinessInformationPrompt ? "Kickoff pending" : "Active guidance",
      description: showBusinessInformationPrompt
        ? "Finish onboarding to activate Triumph mentor support."
        : "Expect proactive nudges and resources tuned to your journey.",
    },
    {
      label: "Workspace focus",
      value: showBusinessInformationPrompt ? "Start with Business Profile" : "Review models weekly",
      description: showBusinessInformationPrompt
        ? "Set the tone for your BRM workspace by sharing your core offers."
        : "Celebrate wins, adjust KPIs, and plan the next momentum markers.",
    },
  ];

  return (
    <ClientShell activePath="/client">
      <PageLayout
        id="home"
        eyebrow="Triumph client workspace"
        title={introTitle}
        description={introSubtitle}
        actions={
          <div className={styles.clientSummary}>
            <span className={styles.clientSummaryEyebrow}>Client</span>
            <span className={styles.clientSummaryName}>{client.name}</span>
            <p className={styles.clientSummaryCopy}>Keep your Triumph profile updated so mentors can tailor every session.</p>
          </div>
        }
      >
        <div className={styles.summaryGrid}>
          <DashboardCard
            icon={<HomeIcon />}
            title={`${models.length} models in motion`}
            description="Active BRM pillars guiding your progress right now."
          />
          <DashboardCard
            icon={<LayersIcon />}
            title={`${milestoneCompletion}% milestone completion`}
            description={`${completedMilestones} of ${totalMilestones || 0} steps complete across all models.`}
          >
            <div className={cardStyles.progressTrack}>
              <div className={cardStyles.progressBar} style={{ width: `${milestoneCompletion}%` }} />
            </div>
          </DashboardCard>
          <DashboardCard
            icon={<SparkleIcon />}
            title={`${upcomingMilestones} upcoming milestones`}
            description="Keep momentum by closing out these next high-impact tasks."
          />
          <DashboardCard
            icon={<UsersIcon />}
            title={`${trackedKpis.length} KPIs tracked`}
            description={`${onTrackKpis} currently meeting or exceeding goals.`}
          />
        </div>

        <div className={styles.twoColumn}>
          <DashboardCard
            eyebrow="Focus"
            title={showBusinessInformationPrompt ? "Complete your business profile" : "Share your latest progress"}
            description={
              showBusinessInformationPrompt
                ? "A filled-in profile unlocks personalized models, KPIs, and mentor prompts for your launch."
                : "Refreshing your details keeps Triumph mentors focused on the momentum that matters most."
            }
          >
            <div className={styles.metricStack}>
              <div className={styles.metricRow}>
                <span>Overall completion</span>
                <span className={styles.metricValue}>{milestoneCompletion}%</span>
              </div>
              <div className={cardStyles.progressTrack}>
                <div className={cardStyles.progressBar} style={{ width: `${milestoneCompletion}%` }} />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            eyebrow="Workspace status"
            title={showBusinessInformationPrompt ? "Unlock Triumph insights" : "Everything is synced"}
            description={
              showBusinessInformationPrompt
                ? "Complete your business information to light up onboarding prompts and personalized mentor prep."
                : "We’re mirroring your latest updates so every mentor touchpoint starts with context."
            }
            ctaLabel={showBusinessInformationPrompt ? "Go to settings" : "Review profile"}
            ctaHref={businessInformationFormHref}
          />
        </div>

        <div className={styles.miniGrid}>
          {quickStats.map((stat) => (
            <DashboardCard key={stat.label} eyebrow={stat.label} title={stat.value} description={stat.description} tone="subtle" />
          ))}
        </div>

        {errors.length > 0 ? <ErrorFallback messages={normalizeErrors(errors)} /> : null}
      </PageLayout>

      {showBusinessInformationPrompt ? (
        <section id="business-profile" className={styles.sectionDivider} aria-hidden />
      ) : null}

      {showBusinessInformationPrompt ? (
        <section id="business-profile-form">
          <BusinessProfileForm />
        </section>
      ) : null}

      <PageLayout
        id="model-generation"
        eyebrow="Model generation"
        title="Design the roadmap that fits your momentum"
        description="Align with your Triumph mentor on offers, KPIs, and milestones before we generate or refine your growth models."
      >
        <div className={styles.miniGrid}>
          <DashboardCard
            eyebrow="Blueprint sessions"
            title="Capture ideas together"
            description="Use the workspace notes to outline value ladders, target audiences, and key programs before each session."
          />
          <DashboardCard
            eyebrow="Document inspiration"
            title="Spotlight what’s working"
            description="Add quick wins and learnings as you go so we can translate momentum into actionable models and KPIs."
          />
          <DashboardCard
            eyebrow="Collaboration"
            title="Keep mentors in the loop"
            description="Share call notes and priorities so your Triumph team can adjust models and KPIs in step with you."
          />
        </div>
      </PageLayout>

      <PageLayout
        id="model-implementation"
        eyebrow="Model implementation"
        title="Make progress visible at every milestone"
        description="Track milestones, KPIs, and lessons learned as you execute so your Triumph mentor can guide the next best move."
      >
        {models.length === 0 ? (
          <DashboardCard
            title="No models yet"
            description="Generate your first model with your mentor to unlock milestone and KPI tracking."
            icon={<LayersIcon />}
            ctaLabel="Start in Model Generation"
            ctaHref="#model-generation"
          />
        ) : (
          models.map((model) => (
            <ModelPanel
              key={model.id}
              model={model}
              milestones={milestonesByModel.get(model.id) ?? []}
              kpis={kpisByModel.get(model.id) ?? []}
            />
          ))
        )}
      </PageLayout>

      <PageLayout
        id="mentor-outreach"
        eyebrow="Mentor outreach"
        title="Stay in rhythm with your Triumph mentor"
        description="Coordinate touchpoints, share wins, and surface blockers so your mentor can respond with the right resources."
      >
        <div className={styles.mentorGrid}>
          {mentorHighlights.map((highlight) => (
            <DashboardCard
              key={highlight.title}
              title={highlight.title}
              description={highlight.description}
              ctaLabel="Open"
              ctaHref={highlight.href}
            />
          ))}
        </div>
      </PageLayout>
    </ClientShell>
  );
}
