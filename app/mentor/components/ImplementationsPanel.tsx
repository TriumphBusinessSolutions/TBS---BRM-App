import styles from "./ImplementationsPanel.module.css";
import type { MentorImplementationRow } from "../dashboard-data";

type ImplementationsPanelProps = {
  implementations: MentorImplementationRow[];
  formatter: Intl.DateTimeFormat;
};

function isCompleted(status: string | null) {
  if (!status) {
    return false;
  }
  return /done|complete|finished|launched/i.test(status);
}

function formatStatus(status: string | null) {
  if (!status) {
    return "Pending";
  }
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ImplementationsPanel({ implementations, formatter }: ImplementationsPanelProps) {
  if (implementations.length === 0) {
    return (
      <section className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>Implementation schedule</span>
        </div>
        <p className={styles.empty}>No implementation plans yet. Align with your client on their next execution steps.</p>
      </section>
    );
  }

  const upcoming = implementations.filter((item) => !isCompleted(item.status));
  const completed = implementations.filter((item) => isCompleted(item.status));

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Implementation schedule</span>
      </div>
      <div className={styles.group}>
        <span className={styles.groupTitle}>Upcoming</span>
        {upcoming.length === 0 ? (
          <p className={styles.empty}>No upcoming launches scheduled.</p>
        ) : (
          upcoming.map((item) => {
            const scheduled = item.scheduled_for ? formatter.format(new Date(item.scheduled_for)) : "Schedule pending";
            return (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemMeta}>{formatStatus(item.status)}</span>
                </div>
                <span className={styles.itemMeta}>{scheduled}</span>
                {item.notes ? <p className={styles.note}>{item.notes}</p> : null}
              </div>
            );
          })
        )}
      </div>
      <div className={styles.group}>
        <span className={styles.groupTitle}>Completed</span>
        {completed.length === 0 ? (
          <p className={styles.empty}>No completed implementations yet.</p>
        ) : (
          completed.map((item) => {
            const scheduled = item.scheduled_for ? formatter.format(new Date(item.scheduled_for)) : "Completed date unavailable";
            return (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemMeta}>{formatStatus(item.status)}</span>
                </div>
                <span className={styles.itemMeta}>{scheduled}</span>
                {item.notes ? <p className={styles.note}>{item.notes}</p> : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
