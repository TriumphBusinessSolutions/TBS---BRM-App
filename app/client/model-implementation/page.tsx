import type { Metadata } from "next";

import ClientShell from "../components/ClientShell";
import DashboardCard from "../components/DashboardCard";
import ErrorFallback from "../components/ErrorFallback";
import ModelPanel, { type KpiRow, type MilestoneRow, type ModelRow } from "../components/ModelPanel";
import PageLayout from "../components/PageLayout";
import { loadDashboardData } from "../dashboard-data";
import { LayersIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Model Implementation | TBS BRM App",
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

export default async function ModelImplementationPage() {
  const data = await loadDashboardData();

  if (!data.supabaseConfigured) {
    return (
      <ClientShell>
        <PageLayout
          id="model-implementation"
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
          id="model-implementation"
          eyebrow="Triumph workspace"
          title="We couldn’t find an active client profile"
          description="Create a client record to unlock growth models, KPIs, and mentor collaboration."
        >
          <ErrorFallback messages={data.errors} />
        </PageLayout>
      </ClientShell>
    );
  }

  const { models, milestones, kpis, errors } = data;
  const milestonesByModel = groupByModel<MilestoneRow>(milestones);
  const kpisByModel = groupByModel<KpiRow>(kpis);

  return (
    <ClientShell>
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
            ctaHref="/client/model-generation"
          />
        ) : (
          models.map((model: ModelRow) => (
            <ModelPanel
              key={model.id}
              model={model}
              milestones={milestonesByModel.get(model.id) ?? []}
              kpis={kpisByModel.get(model.id) ?? []}
            />
          ))
        )}

        {errors.length > 0 ? <ErrorFallback messages={errors} /> : null}
      </PageLayout>
    </ClientShell>
  );
}
