import type { ReactNode } from "react";

import Icon from "./Icon";
import styles from "./ActivityFeed.module.css";
import { ChatIcon, SparkleIcon, UsersIcon } from "./icons";

type ActivityKind = "model" | "implementation" | "message";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string | null;
  meta?: string;
};

type ActivityFeedProps = {
  events: ActivityEvent[];
  formatter: Intl.DateTimeFormat;
};

const BADGE_STYLES: Record<ActivityKind, { className: string; label: string }> = {
  model: { className: "bg-sky-100 text-sky-700", label: "Model" },
  implementation: { className: "bg-amber-100 text-amber-700", label: "Implementation" },
  message: { className: "bg-emerald-100 text-emerald-700", label: "Message" },
};

const ICONS: Record<ActivityKind, ReactNode> = {
  model: (
    <Icon size="sm" aria-hidden>
      <SparkleIcon />
    </Icon>
  ),
  implementation: (
    <Icon size="sm" aria-hidden>
      <UsersIcon />
    </Icon>
  ),
  message: (
    <Icon size="sm" aria-hidden>
      <ChatIcon />
    </Icon>
  ),
};

export default function ActivityFeed({ events, formatter }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <section className={styles.feed} aria-live="polite">
        <div className={styles.header}>
          <span className={styles.headerTitle}>Activity timeline</span>
        </div>
        <p className={styles.empty}>No recent activity yet. Encourage your client to update their workspace.</p>
      </section>
    );
  }

  return (
    <section className={styles.feed} aria-live="polite">
      <div className={styles.header}>
        <span className={styles.headerTitle}>Activity timeline</span>
      </div>
      <div className={styles.list}>
        {events.map((event) => {
          const badge = BADGE_STYLES[event.kind];
          const icon = ICONS[event.kind];
          const timestamp = event.timestamp ? formatter.format(new Date(event.timestamp)) : "Time unavailable";

          return (
            <div key={event.id} className={styles.item}>
              <div className={styles.itemHeader}>
                {icon}
                <span>{event.title}</span>
                <span className={`${styles.badge} ${badge.className}`.trim()}>{badge.label}</span>
              </div>
              <p className={styles.details}>{event.detail}</p>
              <p className={styles.details}>
                {timestamp}
                {event.meta ? ` • ${event.meta}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
