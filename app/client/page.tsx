import type { Metadata } from "next";

import BusinessProfileForm from "./BusinessProfileForm";
import ClientShell from "./components/ClientShell";
import DashboardCard from "./components/DashboardCard";
import ErrorFallback from "./components/ErrorFallback";
import PageLayout from "./components/PageLayout";
import { loadDashboardData } from "./dashboard-data";
import styles from "./page.module.css";
import cardStyles from "./components/DashboardCard.module.css";
import { HomeIcon, LayersIcon, SparkleIcon, UsersIcon } from "./components/icons";

export const metadata: Metadata = {
  title: "Client Dashboard | TBS BRM App",
};

export default async function ClientDashboardPage() {
  const data = await loadDashboardData();

  if (!data.supabaseConfigured) {
    return (
      <ClientShell>
        <PageLayout
          id="home"
          eyebrow="Triumph workspace"
          title="We need a quick configuration update"
          description="Your dashboard depends on the Supabase connection. Update the environment variables to unlock your personalized view."
        >
          <ErrorFallback messages={data.errors} />
        </PageLayout>
      </ClientShell>
    );
  }

  if (!data.client) {
    return (
      <ClientShell>
        <PageLayout
          id="home"
          eyebrow="Triumph workspace"
          title="We couldn’t find an active client profile"
          description="Create a client record to unlock growth models, KPIs, and mentor collaboration."
        >
          <ErrorFallback messages={data.errors} />
        </PageLayout>
      </ClientShell>
    );
  }

  const { client, models, milestones, kpis, showBusinessInformationPrompt, businessInformationFormHref, errors } = data;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((milestone) => milestone.done).length;
  const milestoneCompletion = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const upcomingMilestones = milestones.filter((milestone) => !milestone.done).length;
  const trackedKpis = kpis.filter((kpi) => kpi.target != null || kpi.value != null);
  const onTrackKpis = trackedKpis.filter(
    (kpi) => kpi.target != null && kpi.value != null && Number(kpi.value) >= Number(kpi.target),
  ).length;

  const introTitle = showBusinessInformationPrompt ? "Let’s get your business ready" : "Welcome back";
  const introSubtitle = showBusinessInformationPrompt
    ? "Complete your business information so we can tailor your Triumph BRM journey to the goals that matter most."
    : "This dashboard keeps your Triumph mentor aligned with where your business is today and where you’re headed next. Keep your profile fresh so our program resources stay tuned to your goals.";

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
    <ClientShell>
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

        {errors.length > 0 ? <ErrorFallback messages={errors} /> : null}
      </PageLayout>

      {showBusinessInformationPrompt ? (
        <section id="business-profile" className={styles.sectionDivider} aria-hidden />
      ) : null}

      {showBusinessInformationPrompt ? (
        <section id="business-profile-form">
          <BusinessProfileForm />
        </section>
      ) : null}
    </ClientShell>
  );
}
