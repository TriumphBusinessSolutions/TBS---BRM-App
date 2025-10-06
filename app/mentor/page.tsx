import ClientGrid, { ClientWithRelations } from "./components/ClientCard";
import { getServerClient } from "../../lib/supabase-server";

type ClientRow = {
  id: string;
  name: string;
};

type ModelRow = {
  id: string;
  client_id: string;
  level: string | null;
  status: string | null;
  created_at: string | null;
};

type MilestoneRow = {
  id: string;
  model_id: string;
  title: string;
  done: boolean;
  created_at: string | null;
};

type KpiRow = {
  id: string;
  model_id: string;
  key: string;
  target: number | null;
  value: number | null;
  period: string | null;
};

export const dynamic = "force-dynamic";

async function fetchClientsData() {
  const supabase = getServerClient();

  if (!supabase) {
    return [];
  }

  const [clientsRes, modelsRes, milestonesRes, kpisRes] = await Promise.all([
    supabase.from("clients").select("id, name"),
    supabase.from("models").select("id, client_id, level, status, created_at"),
    supabase.from("milestones").select("id, model_id, title, done, created_at"),
    supabase.from("kpis").select("id, model_id, key, target, value, period"),
  ]);

  if (clientsRes.error) {
    console.error("Error fetching clients", clientsRes.error);
  }
  if (modelsRes.error) {
    console.error("Error fetching models", modelsRes.error);
  }
  if (milestonesRes.error) {
    console.error("Error fetching milestones", milestonesRes.error);
  }
  if (kpisRes.error) {
    console.error("Error fetching KPIs", kpisRes.error);
  }

  const clients = (clientsRes.data ?? []) as ClientRow[];
  const models = (modelsRes.data ?? []) as ModelRow[];
  const milestones = (milestonesRes.data ?? []) as MilestoneRow[];
  const kpis = (kpisRes.data ?? []) as KpiRow[];

  const modelsByClient = new Map<string, ModelRow[]>();
  models.forEach((model) => {
    const existing = modelsByClient.get(model.client_id) ?? [];
    existing.push(model);
    modelsByClient.set(model.client_id, existing);
  });

  const milestonesByModel = new Map<string, MilestoneRow[]>();
  milestones.forEach((milestone) => {
    const existing = milestonesByModel.get(milestone.model_id) ?? [];
    existing.push(milestone);
    milestonesByModel.set(milestone.model_id, existing);
  });

  const kpisByModel = new Map<string, KpiRow[]>();
  kpis.forEach((kpi) => {
    const existing = kpisByModel.get(kpi.model_id) ?? [];
    existing.push(kpi);
    kpisByModel.set(kpi.model_id, existing);
  });

  const clientsWithRelations: ClientWithRelations[] = clients.map((client) => {
    const clientModels = modelsByClient.get(client.id) ?? [];
    return {
      ...client,
      models: clientModels.map((model) => ({
        ...model,
        milestones: milestonesByModel.get(model.id) ?? [],
        kpis: kpisByModel.get(model.id) ?? [],
      })),
    };
  });

  return clientsWithRelations;
}

export default async function MentorPage() {
  const clients = await fetchClientsData();

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Mentor/Admin — All Clients</h1>
        <p className="text-sm text-slate-500">
          Review client models, milestones, and KPIs. Use the filters below to
          focus the list.
        </p>
      </header>
      <ClientGrid clients={clients} />
    </div>
  );
}
