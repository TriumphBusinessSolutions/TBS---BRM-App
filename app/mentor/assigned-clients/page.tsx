import type { Metadata } from "next";

import { loadMentorDashboardData } from "../dashboard-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Assigned Clients | Triumph Mentor Workspace",
};

export default async function AssignedClientsPage() {
  const data = await loadMentorDashboardData();

  if (!data.supabaseConfigured) {
    return (
      <div className={styles.container}>
        <section className={styles.intro}>
          <h1 className={styles.title}>Assigned clients</h1>
          <p className={styles.subtitle}>
            Connect Supabase to populate this workspace with the clients you’re guiding.
          </p>
        </section>
        <div className={styles.empty}>We can’t reach Supabase yet. Add your credentials and refresh.</div>
      </div>
    );
  }

  if (data.clients.length === 0) {
    return (
      <div className={styles.container}>
        <section className={styles.intro}>
          <h1 className={styles.title}>Assigned clients</h1>
          <p className={styles.subtitle}>
            When clients are assigned to you, they’ll appear here with quick stats and activity summaries.
          </p>
        </section>
        <div className={styles.empty}>No clients are assigned yet.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.intro}>
        <h1 className={styles.title}>Assigned clients</h1>
        <p className={styles.subtitle}>
          Review every workspace you’re supporting along with the volume of models, implementations, and current messages.
        </p>
      </section>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Models</th>
              <th scope="col">Implementations</th>
              <th scope="col">Unread messages</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((client) => {
              const unread = client.messages.filter((message) => !message.read_at).length;
              return (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.models.length}</td>
                  <td>{client.implementations.length}</td>
                  <td>{unread}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
