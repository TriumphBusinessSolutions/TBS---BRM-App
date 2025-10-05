import { notFound } from "next/navigation";
import PromptGenerator, { PromptContextItem } from "./PromptGenerator";
import { getServerClient } from "@/lib/supabase-server";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

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

const BUSINESS_INFO_FIELD_ORDER = [
  "business_name",
  "ideal_client_profile",
  "primary_offer",
  "primary_offer_promise",
  "primary_offer_price",
  "primary_marketing_channel",
  "average_client_value",
  "average_monthly_revenue",
  "monthly_revenue_goal",
  "sales_process",
  "fulfillment_bottleneck",
  "team_size",
  "growth_goal",
  "notes",
] as const;

const BUSINESS_INFO_LABELS: Record<string, string> = {
  business_name: "Business name",
  ideal_client_profile: "Ideal client",
  primary_offer: "Primary offer",
  primary_offer_promise: "Offer promise",
  primary_offer_price: "Offer price",
  primary_marketing_channel: "Primary marketing channel",
  average_client_value: "Average client value",
  average_monthly_revenue: "Average monthly revenue",
  monthly_revenue_goal: "Monthly revenue goal",
  sales_process: "Sales process",
  fulfillment_bottleneck: "Fulfillment bottleneck",
  team_size: "Team size",
  growth_goal: "Growth goal",
  notes: "Notes",
};

const BUSINESS_INFO_FIELD_ORDER_MAP = new Map(
  BUSINESS_INFO_FIELD_ORDER.map((field, index) => [field, index])
);

const BUSINESS_INFO_IGNORED_KEYS = new Set(["id", "client_id", "created_at", "updated_at"]);

type ClientRecord = Database["public"]["Tables"]["clients"]["Row"];

type ModelRecord = Database["public"]["Tables"]["models"]["Row"];

type BusinessInformationRecord = Database["public"]["Tables"]["client_business_information"]["Row"];

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

function startCase(value: string): string {
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatBusinessInfoEntries(
  info: BusinessInformationRecord | null
): PromptContextItem[] {
  if (!info) {
    return [];
  }

  const entries = Object.entries(info).filter(([key, rawValue]) => {
    if (BUSINESS_INFO_IGNORED_KEYS.has(key)) {
      return false;
    }

    if (rawValue === null || typeof rawValue === "undefined") {
      return false;
    }

    const value = String(rawValue).trim();
    return value.length > 0;
  });

  entries.sort((a, b) => {
    const orderA =
      BUSINESS_INFO_FIELD_ORDER_MAP.get(
        a[0] as (typeof BUSINESS_INFO_FIELD_ORDER)[number]
      ) ?? Number.MAX_SAFE_INTEGER;
    const orderB =
      BUSINESS_INFO_FIELD_ORDER_MAP.get(
        b[0] as (typeof BUSINESS_INFO_FIELD_ORDER)[number]
      ) ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a[0].localeCompare(b[0]);
  });

  return entries.map(([key, rawValue]) => ({
    label: BUSINESS_INFO_LABELS[key] ?? startCase(key),
    value: String(rawValue).trim(),
  }));
}

function buildPromptContextSummary(items: PromptContextItem[]): string {
  if (items.length === 0) {
    return "";
  }

  return items
    .map((item) => `${item.label}: ${item.value}`)
    .join(" | ");
}

export default async function ClientDashboardPage({ params }: PageProps) {
  const supabase = getServerClient();
  const { clientId } = params;

  const isDev = process.env.NODE_ENV !== "production";
  const usingMockData = !supabase && isDev;

  if (!supabase && !usingMockData) {
    throw new Error(
      "Supabase credentials are required to load client dashboard data."
    );
  }

  let client: ClientRecord | null = null;
  let clientError: PostgrestError | null = null;
  let models: ModelRecord[] = [];
  let modelsError: PostgrestError | null = null;
  let businessInfo: BusinessInformationRecord | null = null;
  let businessInfoError: PostgrestError | null = null;

  if (supabase) {
    const [clientResult, modelsResult, businessInfoResult] = await Promise.all([
      supabase
        .from("clients")
        .select("id,name,email,phone,created_at,updated_at")
        .eq("id", clientId)
        .maybeSingle<ClientRecord>(),
      supabase
        .from("models")
        .select("id,client_id,level,status,created_at,updated_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true }),
      supabase
        .from("client_business_information")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle<BusinessInformationRecord>(),
    ]);

    client = (clientResult.data as ClientRecord | null) ?? null;
    clientError = (clientResult.error as PostgrestError | null) ?? null;

    models = (modelsResult.data as ModelRecord[] | null) ?? [];
    modelsError = (modelsResult.error as PostgrestError | null) ?? null;

    businessInfo =
      (businessInfoResult.data as BusinessInformationRecord | null) ?? null;
    businessInfoError =
      (businessInfoResult.error as PostgrestError | null) ?? null;
  } else if (usingMockData) {
    client = {
      id: clientId,
      name: "Sample Client",
      email: null,
      phone: null,
      created_at: null,
      updated_at: null,
    };

    models = [
      {
        id: "mock-model-1",
        client_id: clientId,
        level: "level_1",
        status: "active",
        created_at: null,
        updated_at: null,
      },
    ];

    businessInfo = {
      id: "mock-business-info",
      client_id: clientId,
      created_at: null,
      updated_at: null,
      business_name: "Sample Ventures",
      ideal_client_profile: "Service-based founders scaling to $1M ARR",
      primary_offer: "12-week accelerator focused on funnel optimization",
      primary_offer_promise: "Launch a validated attraction funnel in 90 days",
      primary_offer_price: "$7,500",
      primary_marketing_channel: "Organic social + paid webinars",
      average_client_value: "$9,800",
      average_monthly_revenue: "$45,000",
      monthly_revenue_goal: "$75,000",
      sales_process: "Strategy session call followed by proposal",
      fulfillment_bottleneck: "Limited sales team capacity",
      team_size: "5",
      growth_goal: "Unlock consistent attraction and upsell pathways",
      notes: "Focus on improving lead-to-call conversion rate.",
    };
  }

  if (!client && !usingMockData) {
    if (clientError?.code === "PGRST116" || clientError?.message?.includes("No rows")) {
      notFound();
    }
    throw clientError ?? new Error("Unable to load client record");
  }

  const clientName = client?.name ?? "Client";

  const unlockedLevels = new Set<LevelKey>();
  (models ?? []).forEach((model) => {
    const normalized = normalizeLevel(model.level ?? null);
    if (normalized) {
      unlockedLevels.add(normalized);
    }
  });

  if (usingMockData && unlockedLevels.size === 0) {
    unlockedLevels.add("level_1");
  }

  const businessContextItems = formatBusinessInfoEntries(businessInfo);
  const generatorContextItems = businessContextItems.slice(0, 6);
  const businessContextSummary = buildPromptContextSummary(businessContextItems);
  const missingBusinessInfo = businessContextItems.length === 0;

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

      {businessInfoError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          We couldn’t load the business information for this client. Prompts will use general guidance until the data is available.
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Business snapshot</h2>
          <p className="text-sm text-slate-600">
            Key information captured during onboarding helps tailor the model generator suggestions.
          </p>
        </header>

        {missingBusinessInfo ? (
          <p className="mt-4 text-sm text-slate-500">
            We don’t have business information on file for this client yet. Encourage them to complete their business profile to unlock tailored prompts.
          </p>
        ) : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {businessContextItems.map((item) => (
              <div key={`${item.label}-${item.value}`} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

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

          const promptsForLevel = businessContextSummary
            ? level.prompts.map(
                (prompt) => `${prompt}

Client context:
${businessContextSummary}`
              )
            : level.prompts;

          return (
            <PromptGenerator
              key={level.key}
              levelLabel={level.label}
              description={level.description}
              prompts={promptsForLevel}
              contextItems={generatorContextItems}
            />
          );
        })}
      </section>
    </main>
  );
}
