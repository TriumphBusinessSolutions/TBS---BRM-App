import Icon from "./Icon";
import styles from "./ModelCard.module.css";
import type { MentorModelRow } from "../dashboard-data";
import { ArrowIcon, SparkleIcon } from "./icons";

type ModelCardProps = {
  model: MentorModelRow;
  formatter: Intl.DateTimeFormat;
};

function toTitle(value: string | null) {
  if (!value) {
    return "Growth model";
  }
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function toStatus(value: string | null) {
  if (!value) {
    return "Status pending";
  }
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ModelCard({ model, formatter }: ModelCardProps) {
  const created = model.created_at ? formatter.format(new Date(model.created_at)) : "Creation date unavailable";

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>{toTitle(model.level)}</span>
          <span className={styles.meta}>Created {created}</span>
        </div>
        <span className={styles.statusChip}>{toStatus(model.status)}</span>
      </div>
      <div className={styles.footer}>
        <span className={styles.meta}>Stay close to this model’s milestones and KPIs.</span>
        <span className={styles.actions}>
          <Icon size="sm" aria-hidden>
            <SparkleIcon />
          </Icon>
          View Model
          <Icon size="sm" aria-hidden>
            <ArrowIcon />
          </Icon>
        </span>
      </div>
    </article>
  );
}
