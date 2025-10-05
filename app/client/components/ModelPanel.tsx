import type { ReactNode } from "react";

export type ModelRow = {
  id: string;
  client_id: string;
  level: string | null;
  status: string | null;
};

export type MilestoneRow = {
  id: string;
  model_id: string;
  title: string | null;
  done: boolean | null;
};

export type KpiRow = {
  id: string;
  model_id: string;
  key: string | null;
  target: number | null;
  value: number | null;
  period: string | null;
};

type ModelPanelProps = {
  model: ModelRow;
  milestones: MilestoneRow[];
  kpis: KpiRow[];
  actions?: ReactNode;
};

export function ModelPanel({ model, milestones, kpis, actions }: ModelPanelProps) {
  const levelLabel = model.level ? model.level.toUpperCase() : "Model";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Model</p>
          <h3 className="text-lg font-semibold text-slate-900">
            {levelLabel}
            {model.status ? (
              <span className="ml-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                {model.status}
              </span>
            ) : null}
          </h3>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Milestones</h4>
          {milestones.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No milestones.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
              {milestones.map((milestone) => (
                <li key={milestone.id}>
                  <span>{milestone.title ?? "Untitled milestone"}</span>
                  {milestone.done ? <span className="ml-2">✅</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700">KPIs</h4>
          {kpis.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No KPIs.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
              {kpis.map((kpi) => (
                <li key={kpi.id}>
                  <span className="font-medium">{kpi.key ?? "KPI"}</span>: {kpi.value ?? "—"} / {kpi.target ?? "—"}
                  {kpi.period ? <span className="ml-1 text-slate-500">({kpi.period})</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default ModelPanel;
