import type { Metadata } from "next";

import Icon from "../components/Icon";
import { BookIcon, SparkleIcon, UsersIcon } from "../components/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Resource Library | Triumph Mentor Workspace",
};

const resources = [
  {
    title: "Strategy playbooks",
    description: "Download Triumph frameworks to guide clients through model ideation, validation, and launch.",
    icon: <SparkleIcon />,
  },
  {
    title: "Coaching templates",
    description: "Prep faster with agenda and recap templates tailored to high-impact mentor sessions.",
    icon: <UsersIcon />,
  },
  {
    title: "Program guides",
    description: "Stay aligned with the latest Triumph methodology updates and success stories.",
    icon: <BookIcon />,
  },
];

export default function ResourceLibraryPage() {
  return (
    <div className={styles.container}>
      <section className={styles.intro}>
        <h1 className={styles.title}>Resource library</h1>
        <p className={styles.subtitle}>
          Access Triumph playbooks, templates, and guides so you always have the right artifact ready for your next client
          moment.
        </p>
      </section>

      <div className={styles.grid}>
        {resources.map((resource) => (
          <article key={resource.title} className={styles.card}>
            <span className={styles.badge}>
              <Icon size="sm" aria-hidden>
                {resource.icon}
              </Icon>
              Triumph
            </span>
            <h2 className={styles.cardTitle}>{resource.title}</h2>
            <p className={styles.cardCopy}>{resource.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
