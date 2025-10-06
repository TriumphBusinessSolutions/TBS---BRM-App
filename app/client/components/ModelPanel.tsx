import styles from "./ModelPanel.module.css";

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
};

export default function ModelPanel({ model, milestones, kpis }: ModelPanelProps) {
  const levelLabel = model.level ? model.level.toUpperCase() : "Model";
  const completedMilestones = milestones.filter((milestone) => milestone.done).length;
  const totalMilestones = milestones.length;
  const milestoneCompletion = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <article className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.summary}>
          <div className={styles.headerTitle}>
            <h3 className={styles.modelName}>{levelLabel}</h3>
            {model.status ? <span className={styles.status}>{model.status}</span> : null}
          </div>
          <p>
            This model keeps your implementation momentum visible. Track milestones and KPIs to spotlight where support unlocks
            the most impact.
          </p>
        </div>
      </header>
      <div className={styles.progress}>
        <div className={styles.progressLabel}>
          <span>Milestone Progress</span>
          <span>
            {completedMilestones}/{totalMilestones || 0}
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${milestoneCompletion}%` }} />
        </div>
      </div>
      <div className={styles.columns}>
        <section className={styles.list}>
          <h4 className={styles.listTitle}>Milestones</h4>
          {milestones.length === 0 ? (
            <p className={styles.listEmpty}>Define the first milestone to align your team on what success looks like.</p>
          ) : (
            milestones.map((milestone) => {
              const done = Boolean(milestone.done);
              return (
                <div key={milestone.id} className={styles.listItem}>
                  <div className={styles.listItemHeader}>
                    <span className={styles.itemLabel}>{milestone.title ?? "Untitled milestone"}</span>
                    <span
                      className={`${styles.badgeDone} ${done ? styles.badgePositive : styles.badgeNeutral}`.trim()}
                    >
                      {done ? "Complete" : "In progress"}
                    </span>
                  </div>
                  <p className={styles.itemBody}>
                    {done
                      ? "Celebrate and note the learnings."
                      : "Outline the next task or dependency to keep this moving."}
                  </p>
                </div>
              );
            })
          )}
        </section>
        <section className={styles.list}>
          <h4 className={styles.listTitle}>KPIs</h4>
          {kpis.length === 0 ? (
            <p className={styles.listEmpty}>Capture measurable outcomes that indicate the model is performing.</p>
          ) : (
            kpis.map((kpi) => {
              const hasTargets = kpi.target != null && kpi.value != null;
              const onTrack = hasTargets ? Number(kpi.value) >= Number(kpi.target) : false;
              return (
                <div key={kpi.id} className={styles.listItem}>
                  <div className={styles.listItemHeader}>
                    <span className={styles.itemLabel}>{kpi.key ?? "KPI"}</span>
                    {hasTargets ? (
                      <span
                        className={`${styles.badgeDone} ${onTrack ? styles.badgePositive : styles.badgeNeutral}`.trim()}
                      >
                        {onTrack ? "On target" : "Needs focus"}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.itemBody}>
                    <span>{kpi.value ?? "—"}</span>
                    {hasTargets ? <span> / {kpi.target}</span> : null}
                    {kpi.period ? <span> · {kpi.period}</span> : null}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </article>
  );
}
