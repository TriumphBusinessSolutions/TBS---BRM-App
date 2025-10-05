"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getSupabaseBrowserClient } from "../lib/supabase";
import type { Database, Json } from "../types/supabase";

type BusinessContextRow = Database["public"]["Tables"]["business_context"]["Row"];
type OfferStackRow = Database["public"]["Tables"]["offer_stack"]["Row"];

type BusinessInfoFormProps = {
  brmLevel: Database["public"]["Enums"]["brm_level"];
  initialContext: BusinessContextRow | null;
  initialOffers: OfferStackRow[];
};

type OfferFormState = {
  slot: 1 | 2 | 3;
  name: string;
  price_point: string;
  fulfillment_type: Database["public"]["Enums"]["fulfillment_type"] | "";
  primary_outcome: string;
};

type FieldErrors = Record<string, string>;

const offerTypes = [
  "service",
  "coaching",
  "agency",
  "saas",
  "ecommerce",
  "local_bm",
  "info_product",
] as const;

const revenueBands = [
  "pre_revenue",
  "lt_250k",
  "_250k_to_1m",
  "_1m_to_5m",
  "gt_5m",
] as const;

const trafficSources = ["organic", "paid", "referrals", "partnerships", "other"] as const;

const retentionModels = ["one_off", "package", "subscription", "retainer", "none"] as const;

const fulfillmentTypes = ["one_to_one", "group", "self_serve", "hybrid"] as const;

type SubmissionOffer = {
  slot: 1 | 2 | 3;
  name: string | null;
  price_point: number | null;
  fulfillment_type: Database["public"]["Enums"]["fulfillment_type"] | null;
  primary_outcome: string | null;
};

type SubmissionData = {
  offer_type: Database["public"]["Enums"]["offer_type"];
  core_promise: string;
  avg_txn_value: number | null;
  revenue_band: Database["public"]["Enums"]["revenue_band"];
  traffic_source: Database["public"]["Enums"]["traffic_source"] | null;
  retention_model: Database["public"]["Enums"]["retention_model"] | null;
  has_upsells: boolean;
  notes: string;
  offers: SubmissionOffer[];
};

const submissionSchema = z
  .object({
    offer_type: z.enum(offerTypes),
    core_promise: z.string().min(1, "Enter your core promise").max(120, "Keep your core promise within 120 characters"),
    avg_txn_value: z
      .number()
      .nonnegative("Use a positive number for average transaction value")
      .nullable(),
    revenue_band: z.enum(revenueBands),
    traffic_source: z.enum(trafficSources).nullable(),
    retention_model: z.enum(retentionModels).nullable(),
    has_upsells: z.boolean(),
    notes: z.string(),
    offers: z
      .array(
        z.object({
          slot: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          name: z
            .string()
            .min(1, "Enter a name for this offer")
            .max(120, "Keep the offer name concise")
            .or(z.literal(null)),
          price_point: z
            .number()
            .nonnegative("Use a positive number for price point")
            .nullable(),
          fulfillment_type: z.enum(fulfillmentTypes).nullable(),
          primary_outcome: z
            .string()
            .max(80, "Keep the outcome within 80 characters")
            .or(z.literal(null)),
        }),
      )
      .length(3, "Provide details for each of the three offer slots"),
  })
  .superRefine((data, ctx) => {
    if (!data.offers[0] || data.offers[0].name === null) {
      ctx.addIssue({
        path: ["offers", 0, "name"],
        message: "Your primary offer (slot 1) is required",
      });
    }

    data.offers.forEach((offer, index) => {
      if (offer.name === null && (offer.price_point !== null || offer.fulfillment_type !== null || offer.primary_outcome !== null)) {
        ctx.addIssue({
          path: ["offers", index, "name"],
          message: "Add a name to describe this offer",
        });
      }
    });
  });

const brmLevelLabels: Record<Database["public"]["Enums"]["brm_level"], string> = {
  level_1: "Level 1",
  level_2_3: "Level 2-3",
  level_4: "Level 4",
};

const brmLevelDescriptions: Record<Database["public"]["Enums"]["brm_level"], string> = {
  level_1: "Building your momentum",
  level_2_3: "Scaling systems & team",
  level_4: "Operating at peak performance",
};

function getInitialOffers(initialOffers: OfferStackRow[]): OfferFormState[] {
  const bySlot = new Map<number, OfferStackRow>();
  initialOffers.forEach((offer) => {
    bySlot.set(offer.slot, offer);
  });

  return [1, 2, 3].map((slot) => {
    const source = bySlot.get(slot) ?? null;
    return {
      slot: slot as 1 | 2 | 3,
      name: source?.name ?? "",
      price_point: source?.price_point != null ? `${source.price_point}` : "",
      fulfillment_type: source?.fulfillment_type ?? "",
      primary_outcome: source?.primary_outcome ?? "",
    };
  });
}

function toCurrencyPlaceholder(slot: number) {
  if (slot === 1) {
    return "e.g. 2997";
  }
  if (slot === 2) {
    return "e.g. 1497";
  }
  return "e.g. 497";
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.length > 0 ? segment[0].toUpperCase() + segment.slice(1) : segment)
    .join(" ");
}

function parseNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function BusinessInfoForm({ brmLevel, initialContext, initialOffers }: BusinessInfoFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [offerType, setOfferType] = useState<BusinessContextRow["offer_type"] | "">(initialContext?.offer_type ?? "");
  const [corePromise, setCorePromise] = useState(initialContext?.core_promise ?? "");
  const [avgTransactionValue, setAvgTransactionValue] = useState(
    initialContext?.avg_txn_value != null ? `${initialContext.avg_txn_value}` : "",
  );
  const [revenueBand, setRevenueBand] = useState<BusinessContextRow["revenue_band"] | "">(
    initialContext?.revenue_band ?? "",
  );
  const [trafficSource, setTrafficSource] = useState<Exclude<BusinessContextRow["traffic_source"], null> | "">(
    initialContext?.traffic_source ?? "",
  );
  const [retentionModel, setRetentionModel] = useState<Exclude<BusinessContextRow["retention_model"], null> | "">(
    initialContext?.retention_model ?? "",
  );
  const [hasUpsells, setHasUpsells] = useState<boolean>(Boolean(initialContext?.has_upsells));
  const [notes, setNotes] = useState(initialContext?.notes ?? "");
  const [upsellName, setUpsellName] = useState("");
  const [upsellTiming, setUpsellTiming] = useState("");
  const [offers, setOffers] = useState<OfferFormState[]>(() => getInitialOffers(initialOffers));

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOfferChange = (slot: 1 | 2 | 3, field: keyof OfferFormState, value: string) => {
    setOffers((current) =>
      current.map((offer) =>
        offer.slot === slot
          ? {
              ...offer,
              [field]: value,
            }
          : offer,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setSubmissionError("Supabase is not configured. Please try again later.");
      return;
    }

    setIsSaving(true);
    setSubmissionError(null);
    setFieldErrors({});

    const submission: SubmissionData = {
      offer_type: offerType as SubmissionData["offer_type"],
      core_promise: corePromise.trim(),
      avg_txn_value: parseNumberInput(avgTransactionValue),
      revenue_band: revenueBand as SubmissionData["revenue_band"],
      traffic_source: trafficSource ? (trafficSource as SubmissionData["traffic_source"]) : null,
      retention_model: retentionModel ? (retentionModel as SubmissionData["retention_model"]) : null,
      has_upsells: hasUpsells,
      notes: notes.trim(),
      offers: offers.map((offer) => {
        const trimmedName = offer.name.trim();
        const trimmedOutcome = offer.primary_outcome.trim();
        return {
          slot: offer.slot,
          name: trimmedName ? trimmedName : null,
          price_point: parseNumberInput(offer.price_point),
          fulfillment_type: offer.fulfillment_type ? offer.fulfillment_type : null,
          primary_outcome: trimmedOutcome ? trimmedOutcome : null,
        } satisfies SubmissionOffer;
      }),
    };

    const validation = submissionSchema.safeParse(submission);

    if (!validation.success) {
      const nextFieldErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const pathKey = issue.path.join(".");
        nextFieldErrors[pathKey] = issue.message;
      }
      setFieldErrors(nextFieldErrors);
      setIsSaving(false);
      return;
    }

    const sanitized = validation.data;

    const upsellDetails: string[] = [];
    if (sanitized.has_upsells) {
      const trimmedUpsellName = upsellName.trim();
      const trimmedUpsellTiming = upsellTiming.trim();
      if (trimmedUpsellName) {
        upsellDetails.push(`Upsell/Downsell: ${trimmedUpsellName}`);
      }
      if (trimmedUpsellTiming) {
        upsellDetails.push(`When offered: ${trimmedUpsellTiming}`);
      }
    }

    let notesWithUpsell = sanitized.notes;
    if (upsellDetails.length > 0) {
      const upsellBlock = `Upsell details:\n${upsellDetails.join("\n")}`;
      notesWithUpsell = notesWithUpsell ? `${notesWithUpsell}\n\n${upsellBlock}` : upsellBlock;
    }

    const payload: Json = {
      brm_level: brmLevel,
      offer_type: sanitized.offer_type,
      core_promise: sanitized.core_promise,
      avg_txn_value: sanitized.avg_txn_value,
      revenue_band: sanitized.revenue_band,
      traffic_source: sanitized.traffic_source,
      retention_model: sanitized.retention_model,
      has_upsells: sanitized.has_upsells,
      notes: notesWithUpsell,
      offers: sanitized.offers.map((offer) => ({
        slot: offer.slot,
        name: offer.name,
        price_point: offer.price_point,
        fulfillment_type: offer.fulfillment_type,
        primary_outcome: offer.primary_outcome,
      })),
    };

    const { error } = await supabase.rpc("upsert_brm_profile", { payload });

    setIsSaving(false);

    if (error) {
      setSubmissionError(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const corePromiseCharactersRemaining = Math.max(120 - corePromise.trim().length, 0);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-10 flex flex-col gap-4 text-center">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
          BRM Level: {brmLevelLabels[brmLevel]}
          <span className="text-xs font-normal text-indigo-500">{brmLevelDescriptions[brmLevel]}</span>
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">Calibrate Your BRM Workspace</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            This snapshot personalizes model ideas and checklists to your current level. Share how your business delivers results so your Mentor and Triumph resources stay tuned to your growth.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">
            <h2 className="text-lg font-semibold text-indigo-900">Business snapshot</h2>
            <p className="mt-1 text-sm text-indigo-700/80">
              Anchor your Triumph workspace with how you serve clients today.
            </p>
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-900" htmlFor="offer_type">
                  Type of business
                </label>
                <select
                  id="offer_type"
                  name="offer_type"
                  className={classNames(
                    "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                    fieldErrors["offer_type"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                  )}
                  value={offerType}
                  onChange={(event) => setOfferType(event.target.value as typeof offerType)}
                  required
                >
                  <option value="" disabled>
                    Select your business model
                  </option>
                  {offerTypes.map((value) => (
                    <option key={value} value={value}>
                      {formatEnumLabel(value)}
                    </option>
                  ))}
                </select>
                {fieldErrors["offer_type"] ? (
                  <p className="text-sm text-rose-500">{fieldErrors["offer_type"]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-indigo-900" htmlFor="core_promise">
                    Core promise
                  </label>
                  <span className="text-xs text-indigo-700/70">{corePromiseCharactersRemaining} characters left</span>
                </div>
                <input
                  id="core_promise"
                  name="core_promise"
                  type="text"
                  maxLength={120}
                  placeholder="We help ___ achieve ___ in ___."
                  className={classNames(
                    "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                    fieldErrors["core_promise"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                  )}
                  value={corePromise}
                  onChange={(event) => setCorePromise(event.target.value)}
                  required
                />
                {fieldErrors["core_promise"] ? (
                  <p className="text-sm text-rose-500">{fieldErrors["core_promise"]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-900" htmlFor="avg_txn_value">
                  Average transaction value
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-400">$
                  </span>
                  <input
                    id="avg_txn_value"
                    name="avg_txn_value"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    className={classNames(
                      "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 pl-7 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                      fieldErrors["avg_txn_value"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                    )}
                    value={avgTransactionValue}
                    onChange={(event) => setAvgTransactionValue(event.target.value)}
                  />
                </div>
                {fieldErrors["avg_txn_value"] ? (
                  <p className="text-sm text-rose-500">{fieldErrors["avg_txn_value"]}</p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-indigo-900" htmlFor="revenue_band">
                    Annual revenue band
                  </label>
                  <select
                    id="revenue_band"
                    name="revenue_band"
                    className={classNames(
                      "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                      fieldErrors["revenue_band"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                    )}
                    value={revenueBand}
                    onChange={(event) => setRevenueBand(event.target.value as typeof revenueBand)}
                    required
                  >
                    <option value="" disabled>
                      Select revenue band
                    </option>
                    {revenueBands.map((value) => (
                      <option key={value} value={value}>
                        {formatEnumLabel(value)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors["revenue_band"] ? (
                    <p className="text-sm text-rose-500">{fieldErrors["revenue_band"]}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-indigo-900" htmlFor="traffic_source">
                    Primary traffic source
                  </label>
                  <select
                    id="traffic_source"
                    name="traffic_source"
                    className={classNames(
                      "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                      fieldErrors["traffic_source"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                    )}
                    value={trafficSource ?? ""}
                    onChange={(event) => setTrafficSource(event.target.value as typeof trafficSource)}
                  >
                    <option value="">Select a source</option>
                    {trafficSources.map((value) => (
                      <option key={value} value={value}>
                        {formatEnumLabel(value)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors["traffic_source"] ? (
                    <p className="text-sm text-rose-500">{fieldErrors["traffic_source"]}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-purple-100 p-6">
            <h2 className="text-lg font-semibold text-purple-900">Top services & programs</h2>
            <p className="mt-1 text-sm text-purple-800/80">
              Capture the three offers you lead with most often. Each can be activated in future playbooks individually or together.
            </p>
            <div className="mt-6 space-y-6">
              {offers.map((offer) => {
                const slotPath = `offers.${offer.slot - 1}.name`;
                const pricePath = `offers.${offer.slot - 1}.price_point`;
                const fulfillmentPath = `offers.${offer.slot - 1}.fulfillment_type`;
                const outcomePath = `offers.${offer.slot - 1}.primary_outcome`;
                return (
                  <div key={offer.slot} className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-purple-200/70">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        {offer.slot}
                      </span>
                      {fieldErrors[slotPath] ? (
                        <span className="text-sm font-medium text-rose-500">{fieldErrors[slotPath]}</span>
                      ) : null}
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-900" htmlFor={`offer-name-${offer.slot}`}>
                          Offer name
                        </label>
                        <input
                          id={`offer-name-${offer.slot}`}
                          name={`offers[${offer.slot}].name`}
                          type="text"
                          placeholder={offer.slot === 1 ? "Flagship program" : "Companion offer"}
                          className={classNames(
                            "w-full rounded-xl border border-purple-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/60",
                            fieldErrors[slotPath] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                          )}
                          value={offer.name}
                          onChange={(event) => handleOfferChange(offer.slot, "name", event.target.value)}
                          required={offer.slot === 1}
                        />
                      </div>

                      <details className="group rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-purple-800">
                          Details
                          <span className="text-xs text-purple-500 group-open:hidden">Tap to expand</span>
                          <span className="hidden text-xs text-purple-500 group-open:inline">Tap to collapse</span>
                        </summary>
                        <div className="mt-4 space-y-4 text-sm">
                          <div className="space-y-1">
                            <label className="text-purple-900" htmlFor={`offer-price-${offer.slot}`}>
                              Price point
                            </label>
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$
                              </span>
                              <input
                                id={`offer-price-${offer.slot}`}
                                name={`offers[${offer.slot}].price_point`}
                                type="number"
                                min={0}
                                step="0.01"
                                inputMode="decimal"
                                placeholder={toCurrencyPlaceholder(offer.slot)}
                                className={classNames(
                                  "w-full rounded-lg border border-purple-200 bg-white px-3 py-2 pl-7 text-sm text-slate-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/60",
                                  fieldErrors[pricePath] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                                )}
                                value={offer.price_point}
                                onChange={(event) => handleOfferChange(offer.slot, "price_point", event.target.value)}
                              />
                            </div>
                            {fieldErrors[pricePath] ? (
                              <p className="text-xs text-rose-500">{fieldErrors[pricePath]}</p>
                            ) : null}
                          </div>

                          <div className="space-y-1">
                            <label className="text-purple-900" htmlFor={`offer-fulfillment-${offer.slot}`}>
                              Fulfillment style
                            </label>
                            <select
                              id={`offer-fulfillment-${offer.slot}`}
                              name={`offers[${offer.slot}].fulfillment_type`}
                              className={classNames(
                                "w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/60",
                                fieldErrors[fulfillmentPath] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                              )}
                              value={offer.fulfillment_type}
                              onChange={(event) =>
                                handleOfferChange(offer.slot, "fulfillment_type", event.target.value as OfferFormState["fulfillment_type"])
                              }
                            >
                              <option value="">Select</option>
                              {fulfillmentTypes.map((value) => (
                                <option key={value} value={value}>
                                  {formatEnumLabel(value)}
                                </option>
                              ))}
                            </select>
                            {fieldErrors[fulfillmentPath] ? (
                              <p className="text-xs text-rose-500">{fieldErrors[fulfillmentPath]}</p>
                            ) : null}
                          </div>

                          <div className="space-y-1">
                            <label className="text-purple-900" htmlFor={`offer-outcome-${offer.slot}`}>
                              Primary outcome <span className="text-xs text-purple-500">(80 characters)</span>
                            </label>
                            <input
                              id={`offer-outcome-${offer.slot}`}
                              name={`offers[${offer.slot}].primary_outcome`}
                              type="text"
                              maxLength={80}
                              placeholder="What transformation does this offer deliver?"
                              className={classNames(
                                "w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/60",
                                fieldErrors[outcomePath] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                              )}
                              value={offer.primary_outcome}
                              onChange={(event) => handleOfferChange(offer.slot, "primary_outcome", event.target.value)}
                            />
                            {fieldErrors[outcomePath] ? (
                              <p className="text-xs text-rose-500">{fieldErrors[outcomePath]}</p>
                            ) : null}
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Customer journey seeds</h2>
          <p className="mt-1 text-sm text-slate-600">
            Map how clients stay in your world so Mentors can recommend next steps.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="retention_model">
                Retention model
              </label>
              <select
                id="retention_model"
                name="retention_model"
                className={classNames(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                  fieldErrors["retention_model"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
                )}
                value={retentionModel ?? ""}
                onChange={(event) => setRetentionModel(event.target.value as typeof retentionModel)}
              >
                <option value="">Select retention style</option>
                {retentionModels.map((value) => (
                  <option key={value} value={value}>
                    {formatEnumLabel(value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-900">Do you offer upsells or downsells?</span>
              <label className="flex w-max items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={hasUpsells}
                  onChange={(event) => setHasUpsells(event.target.checked)}
                />
                <span className="text-sm text-slate-700">Yes, include upsells</span>
              </label>
            </div>
          </div>

          {hasUpsells ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900" htmlFor="upsell_name">
                  Existing upsell/downsell name
                </label>
                <input
                  id="upsell_name"
                  name="upsell_name"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  value={upsellName}
                  onChange={(event) => setUpsellName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900" htmlFor="upsell_timing">
                  When is it offered?
                </label>
                <input
                  id="upsell_timing"
                  name="upsell_timing"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  value={upsellTiming}
                  onChange={(event) => setUpsellTiming(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Mentor notes & momentum markers</h2>
          <p className="mt-1 text-sm text-slate-600">
            Capture wins, goals, or what you want your Mentor to spotlight over the next 30–90 days.
          </p>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              placeholder="Mentor notes, goals, milestones, targets (30–90 days)"
              className={classNames(
                "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                fieldErrors["notes"] && "border-rose-400 focus:border-rose-400 focus:ring-rose-200",
              )}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        {submissionError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {submissionError}
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row">
          <p>
            Saving keeps your Mentor aligned with what&#39;s working now, so Triumph can unlock the right plays next.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save & Return to Dashboard"}
          </button>
        </div>
      </form>
    </section>
  );
}
