import { notFound } from "next/navigation";
import PromptGenerator from "./PromptGenerator";
import { getServerClient } from "@/lib/supabase-server";
import type { PostgrestError } from "@supabase/supabase-js";

const LEVELS = [
  {
    key: "level_1" as const,
    label: "Level 1 — Attraction",
    description: "Design front-end systems that consistently bring new prospects into the pipeline.",
    synonyms: ["level_1", "level1", "l1", "attraction", "attraction_model", "level 1"],
    prompts: [
      "Draft an attraction model that leverages a high-value lead magnet and a 5-day nurture sequence to qualify prospects.",
      "Outline a webinar-based attraction funnel that moves cold traffic from awareness to a booked strategy session.",
      "Design a paid social campaign that pairs a quiz opt-in with a follow-up call offer to surface ready-to-buy leads.",
    ],
  },
  {
    key: "level_2" as const,
    label: "Level 2 — Upsell",
    description: "Increase average order value by expanding the offer stack clients see after their first purchase.",
    synonyms: ["level_2", "level2", "l2", "upsell", "upsell_model", "level 2"],
    prompts: [
      "Design an upsell path that bundles implementation support immediately after a course purchase.",
      "Outline a premium coaching upgrade offer triggered after clients complete an onboarding checklist.",
      "Create a post-purchase mini-workshop that drives buyers into a higher-touch mastermind within 14 days.",
    ],
  },
  {
    key: "level_3" as const,
    label: "Level 3 — Downsell",
    description: "Capture otherwise lost revenue with alternative offers for leads or customers who hesitate to convert.",
    synonyms: ["level_3", "level3", "l3", "downsell", "downsell_model", "level 3"],
    prompts: [
      "Map a downsell sequence that offers a self-paced toolkit when prospects abandon a premium program checkout.",
      "Draft a save-offer email flow that presents a payment plan to prospects who decline a full-pay option.",
      "Create a low-ticket trial offer that re-engages churn-risk clients before they cancel.",
    ],
  },
  {
    key: "level_4" as const,
    label: "Level 4 — Continuity",
    description: "Build recurring value that keeps clients enrolled and growing month after month.",
    synonyms: ["level_4", "level4", "l4", "continuity", "continuity_model", "level 4"],
    prompts: [
      "Design a continuity program that blends monthly strategy calls with a private implementation community.",
      "Outline a retention sprint that layers quarterly planning intensives into an existing membership.",
      "Create a continuity model that rewards milestone completion with tiered benefits and surprise bonuses.",
    ],
  },
];

type LevelKey = (typeof LEVELS)[number]["key"];

type ClientRecord = {
  id: string;
  name: string;
};

type ModelRecord = {
  id: string;
  level: string | null;
  status: string | null;
};

function normalizeLevel(level: string | null): LevelKey | null {
  if (!level) {
    return null;
  }

  const normalized = level.toLowerCase().replace(/\s+/g, "");

  for (const entry of LEVELS) {
    if (entry.synonyms.some((syn) => syn.replace(/\s+/g, "") === normalized)) {
      return entry.key;
    }
  }

  return null;
}

type PageProps = {
  params: { clientId: string };
};

export default async function ClientDashboardPage({ params }: PageProps) {
  const supabase = getServerClient();
  const { clientId } = params;

  const [clientResult, modelsResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id,name")
      .eq("id", clientId)
      .maybeSingle<ClientRecord>(),
    supabase
      .from("models")
      .select("id,level,status")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true }),
  ]);

  const client = clientResult.data as ClientRecord | null;
  const clientError = clientResult.error as PostgrestError | null;

  const isDev = process.env.NODE_ENV !== "production";
  const usingMockData = !client && isDev;

  if (!client && !usingMockData) {
    if (clientError?.code === "PGRST116" || clientError?.message?.includes("No rows")) {
      notFound();
    }
    throw clientError ?? new Error("Unable to load client record");
  }

  const models = (modelsResult.data as ModelRecord[] | null) ?? [];
  const modelsError = usingMockData ? null : ((modelsResult.error as PostgrestError | null) ?? null);

  let clientName: string;
  const unlockedLevels = new Set<LevelKey>();

  if (usingMockData) {
    clientName = "Sample Client";
    unlockedLevels.add("level_1");
  } else {
    clientName = client!.name;
    models.forEach((model) => {
      const normalized = normalizeLevel(model.level);
      if (normalized) {
        unlockedLevels.add(normalized);
      }
    });
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-slate-500">Client Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">{clientName}</h1>
        <p className="text-sm text-slate-600">
          Generate BRM model ideas aligned to the levels that are currently unlocked for this client.
        </p>
        {usingMockData ? (
          <p className="text-xs text-slate-500">
            Showing sample data because Supabase credentials are missing. Provide real credentials to load live data.
          </p>
        ) : null}
      </header>

      {modelsError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          We couldn’t load model data for this client. Some features may be unavailable until the connection is restored.
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {LEVELS.map((level) => {
          const isUnlocked = unlockedLevels.has(level.key);

          if (!isUnlocked) {
            return (
              <article
                key={level.key}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-100 p-5 text-slate-500"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{level.label}</h2>
                  <p className="text-sm">Locked — work with your coach to unlock this level.</p>
                </div>
                <p className="text-xs uppercase tracking-wide">Model generator locked</p>
              </article>
            );
          }

          return (
            <PromptGenerator
              key={level.key}
              levelLabel={level.label}
              description={level.description}
              prompts={level.prompts}
            />
          );
        })}
      </section>
    </main>
  );
}
