import ModelPanel, {
  type KpiRow,
  type MilestoneRow,
  type ModelRow,
} from "./components/ModelPanel";
import { supabase } from "../../lib/supabase";

type ClientRow = {
  id: string;
  name: string;
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

export default async function ClientDashboardPage() {
  const {
    data: client,
    error: clientError,
  } = await supabase
    .from("clients")
    .select("id,name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<ClientRow>();

  const errors: string[] = [];
  if (clientError) {
    errors.push(clientError.message);
  }

  if (!client) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Client — My BRM View</h1>
          <p className="text-sm text-slate-600">
            Overview of your BRM progress, milestones, and KPIs.
          </p>
        </header>

        {errors.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">There was a problem loading client data.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

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

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Client — My BRM View</h1>
        <p className="text-sm text-slate-600">
          Overview of your BRM progress, milestones, and KPIs.
        </p>
      </header>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">There was a problem loading client data.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Client: {client.name}</h2>

        {models.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No models yet.</p>
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
