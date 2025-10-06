import type { Metadata } from "next";

import ClientShell from "../components/ClientShell";
import DashboardCard from "../components/DashboardCard";
import ErrorFallback from "../components/ErrorFallback";
import PageLayout from "../components/PageLayout";
import { loadDashboardData } from "../dashboard-data";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Mentor Outreach | TBS BRM App",
};

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

export default async function MentorOutreachPage() {
  const data = await loadDashboardData();

  if (!data.supabaseConfigured) {
    return (
      <ClientShell>
        <PageLayout
          id="mentor-outreach"
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
          id="mentor-outreach"
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

        {data.errors.length > 0 ? <ErrorFallback messages={data.errors} /> : null}
      </PageLayout>
    </ClientShell>
  );
}
