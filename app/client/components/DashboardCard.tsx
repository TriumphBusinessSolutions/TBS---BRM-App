import type { ReactNode } from "react";

import Icon from "./Icon";
import styles from "./DashboardCard.module.css";
import { ArrowIcon } from "./icons";

type DashboardCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  footer?: ReactNode;
  tone?: "default" | "subtle";
  className?: string;
};

export default function DashboardCard({
  eyebrow,
  title,
  description,
  icon,
  children,
  ctaLabel,
  ctaHref,
  footer,
  tone = "default",
  className,
}: DashboardCardProps) {
  const cardClasses = [styles.card];
  if (tone === "subtle") {
    cardClasses.push(styles.surfaceSubtle);
  }
  if (className) {
    cardClasses.push(className);
  }

  const body = description ? <p className={styles.bodyText}>{description}</p> : null;

  return (
    <article className={cardClasses.join(" ")}> 
      <header className={styles.header}>
        {icon ? <Icon size="md">{icon}</Icon> : null}
        <div className={styles.content}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h3 className={styles.title}>{title}</h3>
          {body}
        </div>
      </header>
      {children}
      {ctaLabel && ctaHref ? (
        <div className={styles.footer}>
          <a className={styles.cta} href={ctaHref}>
            <span>{ctaLabel}</span>
            <Icon size="sm" aria-hidden>
              <ArrowIcon />
            </Icon>
          </a>
        </div>
      ) : null}
      {footer}
    </article>
  );
}
