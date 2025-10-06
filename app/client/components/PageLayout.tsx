import type { ReactNode } from "react";

import styles from "./PageLayout.module.css";

type PageLayoutProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function PageLayout({ id, eyebrow, title, description, children, actions }: PageLayoutProps) {
  return (
    <section id={id} className={styles.section}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 className={styles.title}>{title}</h2>
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        <p className={styles.subtitle}>{description}</p>
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
