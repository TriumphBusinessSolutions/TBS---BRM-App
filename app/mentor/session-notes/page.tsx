import type { Metadata } from "next";

import Icon from "../components/Icon";
import { loadMentorDashboardData } from "../dashboard-data";
import { ChatIcon } from "../components/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Session Notes | Triumph Mentor Workspace",
};

export default async function SessionNotesPage() {
  const data = await loadMentorDashboardData();
  const clientCount = data.clients.length;

  return (
    <div className={styles.container}>
      <section className={styles.intro}>
        <h1 className={styles.title}>Session notes</h1>
        <p className={styles.subtitle}>
          Prepare for upcoming mentor calls with structured notes and follow-up actions tailored to each client workspace.
        </p>
      </section>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Capture insights from every meeting</h2>
        <p className={styles.cardCopy}>
          {clientCount > 0
            ? `You’re supporting ${clientCount} client${clientCount === 1 ? "" : "s"}. Create a note for each session so context stays fresh for your next check-in.`
            : "Once clients are assigned, you’ll be able to attach structured notes to each account to keep your momentum high."}
        </p>
        <span className={styles.actionRow}>
          <Icon size="sm" aria-hidden>
            <ChatIcon />
          </Icon>
          Start a new note (coming soon)
        </span>
      </div>
    </div>
  );
}
