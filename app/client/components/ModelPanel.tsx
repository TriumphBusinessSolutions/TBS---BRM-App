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
  const completedMilestones = milestones.filter((milestone) => milestone.done).length;
  const totalMilestones = milestones.length;
  const milestoneCompletion =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <section className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_45px_120px_rgba(1,9,30,0.35)] transition-all hover:border-white/20">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-[#fa9100]/30 blur-3xl transition group-hover:opacity-80" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#004aad]/35 blur-3xl transition group-hover:opacity-90" />
      </div>

      <div className="relative space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8fd6ff]/80">Model</p>
            <h3 className="text-2xl font-semibold text-slate-100">
              {levelLabel}
              {model.status ? (
                <span className="ml-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100/80">
                  {model.status}
                </span>
              ) : null}
            </h3>
          </div>
          {actions ? <div className="flex items-center gap-2 text-slate-100">{actions}</div> : null}
        </header>

        <div>
          <div className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-300/80">
            <span>Milestone Progress</span>
            <span>
              {completedMilestones}/{totalMilestones || 0}
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#fa9100] via-[#ffb341] to-[#8fd6ff]"
              style={{ width: `${milestoneCompletion}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {milestoneCompletion}% of milestones complete
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Milestones</h4>
            {milestones.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-300">
                No milestones yet. Add your first step to unlock progress tracking.
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm text-slate-200">
                {milestones.map((milestone) => {
                  const done = Boolean(milestone.done);

                  return (
                    <li
                      key={milestone.id}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_12px_40px_rgba(2,8,28,0.55)]"
                    >
                      <span
                        className={`mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          done ? "bg-emerald-400" : "bg-white/30"
                        }`}
                        aria-hidden
                      />
                      <div>
                        <p className="font-medium text-slate-100">
                          {milestone.title ?? "Untitled milestone"}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-slate-400/80">
                          {done ? "Completed" : "In progress"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-100">KPIs</h4>
            {kpis.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-300">
                No KPIs yet. Capture the metrics that define success for this model.
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm text-slate-200">
                {kpis.map((kpi) => {
                  const hasTargets = kpi.target != null && kpi.value != null;
                  const onTrack = hasTargets ? Number(kpi.value) >= Number(kpi.target) : false;

                  return (
                    <li
                      key={kpi.id}
                      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_12px_40px_rgba(2,8,28,0.55)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-100">{kpi.key ?? "KPI"}</span>
                        {hasTargets ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              onTrack
                                ? "bg-emerald-400/20 text-emerald-200"
                                : "bg-amber-400/20 text-amber-200"
                            }`}
                          >
                            {onTrack ? "On track" : "Needs focus"}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-300">
                        {kpi.value ?? "—"}
                        {hasTargets ? <span className="text-slate-400">/{kpi.target}</span> : null}
                        {kpi.period ? (
                          <span className="ml-2 text-xs uppercase tracking-wide text-slate-400/80">{kpi.period}</span>
                        ) : null}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ModelPanel;
