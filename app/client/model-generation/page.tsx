import type { Metadata } from "next";

import ClientShell from "../components/ClientShell";
import DashboardCard from "../components/DashboardCard";
import ErrorFallback from "../components/ErrorFallback";
import PageLayout from "../components/PageLayout";
import { loadDashboardData } from "../dashboard-data";
import styles from "../page.module.css";
import { SparkleIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Model Generation | TBS BRM App",
};

export default async function ModelGenerationPage() {
  const data = await loadDashboardData();

  if (!data.supabaseConfigured) {
    return (
      <ClientShell>
        <PageLayout
          id="model-generation"
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
          id="model-generation"
          eyebrow="Triumph workspace"
          title="We couldn’t find an active client profile"
          description="Create a client record to unlock growth models, KPIs, and mentor collaboration."
        >
          <ErrorFallback messages={data.errors} />
        </PageLayout>
      </ClientShell>
    );
  }

  return (
    <ClientShell>
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
            icon={<SparkleIcon />}
          />
          <DashboardCard
            eyebrow="Document inspiration"
            title="Spotlight what’s working"
            description="Add quick wins and learnings as you go so we can translate momentum into actionable models and KPIs."
            icon={<SparkleIcon />}
          />
          <DashboardCard
            eyebrow="Collaboration"
            title="Keep mentors in the loop"
            description="Share call notes and priorities so your Triumph team can adjust models and KPIs in step with you."
            icon={<SparkleIcon />}
          />
        </div>

        {data.errors.length > 0 ? <ErrorFallback messages={data.errors} /> : null}
      </PageLayout>
    </ClientShell>
  );
}
