"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KpiInlineEditor from "./KpiInlineEditor";

type Kpi = {
  id: string;
  model_id: string;
  key: string;
  target: number | null;
  value: number | null;
  period: string | null;
};

type Milestone = {
  id: string;
  model_id: string;
  title: string;
  done: boolean;
  created_at: string | null;
};

type Model = {
  id: string;
  client_id: string;
  level: string | null;
  status: string | null;
  created_at: string | null;
  milestones: Milestone[];
  kpis: Kpi[];
};

type Client = {
  id: string;
  name: string;
  models: Model[];
};

export type ClientWithRelations = Client;

type ToastState = {
  message: string;
  type: "success" | "error";
};

type LevelFilter = "all" | "attraction" | "upsell" | "downsell" | "continuity";

type ClientGridProps = {
  clients: ClientWithRelations[];
};

const levelOptions: { label: string; value: LevelFilter }[] = [
  { label: "All Levels", value: "all" },
  { label: "Attraction", value: "attraction" },
  { label: "Upsell", value: "upsell" },
  { label: "Downsell", value: "downsell" },
  { label: "Continuity", value: "continuity" },
];

export default function ClientGrid({ clients }: ClientGridProps) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [kpiValues, setKpiValues] = useState<Record<string, number | null>>(() => {
    const initial: Record<string, number | null> = {};
    clients.forEach((client) => {
      client.models.forEach((model) => {
        model.kpis.forEach((kpi) => {
          initial[kpi.id] = kpi.value;
        });
      });
    });
    return initial;
  });

  useEffect(() => {
    setKpiValues(() => {
      const initial: Record<string, number | null> = {};
      clients.forEach((client) => {
        client.models.forEach((model) => {
          model.kpis.forEach((kpi) => {
            initial[kpi.id] = kpi.value;
          });
        });
      });
      return initial;
    });
  }, [clients]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return clients
      .map((client) => {
        if (
          normalizedSearch &&
          !client.name.toLowerCase().includes(normalizedSearch)
        ) {
          return null;
        }

        const models =
          level === "all"
            ? client.models
            : client.models.filter((model) =>
                (model.level ?? "").toLowerCase() === level
              );

        if (level !== "all" && models.length === 0) {
          return null;
        }

        return {
          ...client,
          models,
        };
      })
      .filter((client): client is ClientWithRelations => Boolean(client));
  }, [clients, level, search]);

  const handleValueChange = (id: string, value: number | null) => {
    setKpiValues((prev) => ({ ...prev, [id]: value }));
  };

  const showToast = (type: ToastState["type"], message: string) => {
    setToast({ type, message });
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-sm">
          <label className="text-sm font-medium text-slate-600" htmlFor="client-search">
            Search Clients
          </label>
          <input
            id="client-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by client name"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          <label className="text-sm font-medium text-slate-600" htmlFor="model-level">
            Filter by Model Level
          </label>
          <select
            id="model-level"
            value={level}
            onChange={(event) => setLevel(event.target.value as LevelFilter)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No clients match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              kpiValues={kpiValues}
              onValueChange={handleValueChange}
              onNotify={showToast}
            />
          ))}
        </div>
      )}

      {toast ? (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm text-white shadow-lg transition-opacity ${
            toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

type ClientCardProps = {
  client: ClientWithRelations;
  kpiValues: Record<string, number | null>;
  onValueChange: (id: string, value: number | null) => void;
  onNotify: (type: ToastState["type"], message: string) => void;
};

function ClientCard({ client, kpiValues, onValueChange, onNotify }: ClientCardProps) {
  const modelCount = client.models.length;
  return (
    <section className="flex h-full flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Client: {client.name}</h2>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {modelCount} model{modelCount === 1 ? "" : "s"}
        </p>
      </div>

      {client.models.length === 0 ? (
        <p className="text-sm text-slate-500">No models available.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {client.models.map((model) => (
            <article
              key={model.id}
              className="rounded-md border border-slate-100 bg-slate-50 p-4 shadow-inner"
            >
              <header className="mb-3 flex flex-col gap-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  {(model.level ?? "Unknown").toUpperCase()}
                  <span className="ml-2 text-xs font-medium normal-case text-slate-500">
                    ({model.status ?? "No status"})
                  </span>
                </p>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Milestones</h3>
                  {model.milestones.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No milestones yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm">
                      {model.milestones.map((milestone) => (
                        <li
                          key={milestone.id}
                          className="flex items-start gap-2 text-slate-600"
                        >
                          <span>{milestone.done ? "✅" : "⏳"}</span>
                          <span>{milestone.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">KPIs</h3>
                  {model.kpis.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No KPIs yet.</p>
                  ) : (
                    <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Key</th>
                            <th className="px-3 py-2 font-medium">Value</th>
                            <th className="px-3 py-2 font-medium">Target</th>
                            <th className="px-3 py-2 font-medium">Period</th>
                          </tr>
                        </thead>
                        <tbody>
                          {model.kpis.map((kpi) => (
                            <tr key={kpi.id} className="border-t border-slate-200">
                              <td className="px-3 py-2 font-medium text-slate-700">
                                {kpi.key}
                              </td>
                              <td className="px-3 py-2">
                                <KpiInlineEditor
                                  kpiId={kpi.id}
                                  value={
                                    Object.prototype.hasOwnProperty.call(
                                      kpiValues,
                                      kpi.id
                                    )
                                      ? kpiValues[kpi.id]
                                      : kpi.value
                                  }
                                  onValueChange={(value) =>
                                    onValueChange(kpi.id, value)
                                  }
                                  onNotify={onNotify}
                                />
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {kpi.target ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {kpi.period ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
