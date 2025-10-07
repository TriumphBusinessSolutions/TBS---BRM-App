"use client";

import { useMemo, useState, useTransition } from "react";

import type { MentorClient, MentorDashboardData } from "../dashboard-data";
import ActivityFeed, { type ActivityEvent } from "./ActivityFeed";
import ChatPreview from "./ChatPreview";
import ClientSelector from "./ClientSelector";
import ImplementationsPanel from "./ImplementationsPanel";
import ModelCard from "./ModelCard";
import styles from "./MentorHomeView.module.css";

function formatTitle(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildActivity(client: MentorClient): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  client.models.forEach((model) => {
    events.push({
      id: `model-${model.id}`,
      kind: "model",
      title: `${formatTitle(model.level, "Growth")} model created`,
      detail: model.status ? `Status set to ${formatTitle(model.status, "Pending")}` : "Status not provided",
      timestamp: model.created_at,
    });
  });

  client.implementations.forEach((implementation) => {
    events.push({
      id: `implementation-${implementation.id}`,
      kind: "implementation",
      title: implementation.title || "Implementation scheduled",
      detail: implementation.status
        ? `Marked as ${formatTitle(implementation.status, "Pending")}`
        : "Status not provided",
      timestamp: implementation.scheduled_for,
      meta: implementation.notes ?? undefined,
    });
  });

  client.messages.forEach((message) => {
    events.push({
      id: `message-${message.id}`,
      kind: "message",
      title: message.sender_role ? `${formatTitle(message.sender_role, "Client")} message` : "Client message",
      detail: message.body ?? "New message",
      timestamp: message.created_at,
    });
  });

  return events.sort((a, b) => {
    const aTime = a.timestamp ? Date.parse(a.timestamp) : 0;
    const bTime = b.timestamp ? Date.parse(b.timestamp) : 0;
    return bTime - aTime;
  });
}

function countUnread(messages: MentorClient["messages"]) {
  return messages.filter((message) => !message.read_at).length;
}

type MentorHomeViewProps = MentorDashboardData;

export default function MentorHomeView({ supabaseConfigured, clients, errors }: MentorHomeViewProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id ?? null);
  const [isSwitching, startTransition] = useTransition();

  const selectedClient = useMemo(() => {
    if (!selectedClientId) {
      return null;
    }
    return clients.find((client) => client.id === selectedClientId) ?? null;
  }, [clients, selectedClientId]);

  const activityEvents = useMemo(() => (selectedClient ? buildActivity(selectedClient) : []), [selectedClient]);

  const modelsFormatter = useMemo(() => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }), []);

  const stats = useMemo(() => {
    if (!selectedClient) {
      return {
        models: 0,
        implementations: 0,
        completedImplementations: 0,
        unreadMessages: 0,
      };
    }

    const completed = selectedClient.implementations.filter((implementation) =>
      /done|complete|finished|launched/i.test(implementation.status ?? ""),
    ).length;

    return {
      models: selectedClient.models.length,
      implementations: selectedClient.implementations.length,
      completedImplementations: completed,
      unreadMessages: countUnread(selectedClient.messages),
    };
  }, [selectedClient]);

  if (!supabaseConfigured) {
    return (
      <div className={styles.placeholder}>
        <span className={styles.placeholderTitle}>We need to connect to the Triumph data service</span>
        <p className={styles.placeholderCopy}>
          Add your Supabase credentials to the environment so mentors can see their assigned clients and live activity.
        </p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className={styles.placeholder}>
        <span className={styles.placeholderTitle}>No clients assigned yet</span>
        <p className={styles.placeholderCopy}>
          Once clients are assigned to you, their activity will appear here so you can monitor momentum in real time.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.intro}>
        <span className={styles.eyebrow}>Mentor home</span>
        <h1 className={styles.title}>Stay aligned with every client in motion</h1>
        <p className={styles.subtitle}>
          Switch between clients to see their latest models, implementation progress, and incoming conversations all in one
          command center.
        </p>
      </section>

      {errors.length > 0 ? (
        <div className={styles.placeholder} role="status">
          <span className={styles.placeholderTitle}>Some data may be missing</span>
          <p className={styles.placeholderCopy}>{errors.join(" ")}</p>
        </div>
      ) : null}

      <div className={styles.selectorRow}>
        <ClientSelector
          clients={clients}
          selectedClientId={selectedClientId}
          onSelect={(id) =>
            startTransition(() => {
              setSelectedClientId(id);
            })
          }
          helperText={isSwitching ? "Loading latest insights…" : "Choose a client workspace to inspect."}
        />
      </div>

      {selectedClient ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active models</span>
              <span className={styles.statValue}>{stats.models}</span>
              <span className={styles.statHint}>Models created and ready for mentor review.</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Implementation items</span>
              <span className={styles.statValue}>{stats.implementations}</span>
              <span className={styles.statHint}>Tasks your client has committed to delivering.</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Completed launches</span>
              <span className={styles.statValue}>{stats.completedImplementations}</span>
              <span className={styles.statHint}>Celebrate progress and plan the next milestone.</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Unread messages</span>
              <span className={styles.statValue}>{stats.unreadMessages}</span>
              <span className={styles.statHint}>Follow up quickly to keep momentum high.</span>
            </div>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.timelineStack}>
              <ActivityFeed events={activityEvents} formatter={modelsFormatter} />
              {selectedClient.models.length > 0 ? (
                selectedClient.models.map((model) => (
                  <ModelCard key={model.id} model={model} formatter={modelsFormatter} />
                ))
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderTitle}>No models yet</span>
                  <p className={styles.placeholderCopy}>
                    Guide your client through building their first Triumph growth model to unlock detailed insights here.
                  </p>
                </div>
              )}
            </div>
            <div className={styles.timelineStack}>
              <ImplementationsPanel implementations={selectedClient.implementations} formatter={modelsFormatter} />
              <ChatPreview messages={selectedClient.messages} formatter={modelsFormatter} />
            </div>
          </div>
        </>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderTitle}>Select a client to begin</span>
          <p className={styles.placeholderCopy}>
            Use the client dropdown above to focus on a workspace. You’ll see their live activity the moment you choose a
            name.
          </p>
        </div>
      )}
    </div>
  );
}
