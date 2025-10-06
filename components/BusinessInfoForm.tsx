"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  onSuccess?: () => void;
  activeClientId?: string | null;
  activeClientName?: string | null;
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
  level_2: "Level 2",
  level_3: "Level 3",
  level_2_3: "Level 2-3",
  level_4: "Level 4",
};

const brmLevelDescriptions: Record<Database["public"]["Enums"]["brm_level"], string> = {
  level_1: "Building your momentum",
  level_2: "Expanding your growth levers",
  level_3: "Strengthening retention systems",
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

const offerTitleMap: Record<OfferFormState["slot"], string> = {
  1: "Flagship offer",
  2: "Signature companion",
  3: "Entry pathway",
};

const ACTIVE_CLIENT_STORAGE_KEY = "tbs-active-client";

type ActiveClientContext = {
  id: string | null;
  name: string | null;
};

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

const baseControlClasses =
  "w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 placeholder:text-slate-400";
const errorControlClasses = "border-rose-400 focus:border-rose-400 focus:ring-rose-200/70";
const fieldLabelClasses = "text-sm font-semibold text-slate-900";
const fieldErrorClasses = "text-sm text-rose-500";
const subheadingClasses = "text-sm font-medium uppercase tracking-[0.2em] text-indigo-500";

export default function BusinessInfoForm({
  brmLevel,
  initialContext,
  initialOffers,
  onSuccess,
  activeClientId = null,
  activeClientName = null,
}: BusinessInfoFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [clientContext, setClientContext] = useState<ActiveClientContext>(() => ({
    id: activeClientId,
    name: activeClientName,
  }));

  const hasClientContext = Boolean(
    (clientContext.id && clientContext.id.length > 0) ||
      (clientContext.name && clientContext.name.length > 0),
  );

  useEffect(() => {
    setClientContext((previous) => {
      if (previous.id === activeClientId && previous.name === activeClientName) {
        return previous;
      }

      return {
        id: activeClientId,
        name: activeClientName,
      };
    });
  }, [activeClientId, activeClientName]);

  useEffect(() => {
    if (!hasClientContext) {
      return;
    }

    try {
      window.localStorage.setItem(
        ACTIVE_CLIENT_STORAGE_KEY,
        JSON.stringify({ id: clientContext.id, name: clientContext.name }),
      );
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Unable to persist active client context", error);
      }
    }
  }, [clientContext, hasClientContext]);

  useEffect(() => {
    if (hasClientContext) {
      return;
    }

    try {
      const stored = window.localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed: unknown = JSON.parse(stored);

      if (typeof parsed !== "object" || parsed === null) {
        return;
      }

      const maybeContext = parsed as Partial<ActiveClientContext>;

      setClientContext({
        id: typeof maybeContext.id === "string" ? maybeContext.id : null,
        name: typeof maybeContext.name === "string" ? maybeContext.name : null,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Unable to restore active client context", error);
      }
    }
  }, [hasClientContext]);

  const clientDisplayName =
    clientContext.name && clientContext.name.trim().length > 0
      ? clientContext.name.trim()
      : clientContext.id && clientContext.id.trim().length > 0
        ? clientContext.id.trim()
        : null;

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

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/dashboard");
    }
  };

  const corePromiseCharactersRemaining = Math.max(120 - corePromise.trim().length, 0);

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-[40px] border border-slate-200/70 bg-white/98 px-6 py-10 shadow-[0_45px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-10 sm:py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-3 rounded-full border border-indigo-200/70 bg-white/95 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
            BRM LEVEL · {brmLevelLabels[brmLevel]} · {brmLevelDescriptions[brmLevel]}
          </span>
          {clientDisplayName ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/95 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-600 shadow-sm">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              Active Client · <span className="text-slate-900 tracking-[0.16em]">{clientDisplayName}</span>
            </span>
          ) : null}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Title:</p>
            <h1 className="text-3xl font-semibold text-slate-900">Business Profile</h1>
            <p className="text-base text-slate-600">
              Please fill out this profile to allow the system to provide you with the most accurate plans, models, and more.
            </p>
            <p className="text-sm text-slate-500">You can return and edit this profile at anytime in your profile settings.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-12">
            <section className="grid gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,3fr)]">
            <div className="rounded-[28px] border border-indigo-100/70 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-8 shadow-inner">
              <span className={subheadingClasses}>Business snapshot</span>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Anchor your current model</h2>
              <p className="mt-3 text-sm text-slate-600">
                Capture the essentials of how you deliver and monetize today so Triumph can personalize dashboards, resources, and
                Mentor recommendations.
              </p>
              <ul className="mt-6 space-y-2 text-left text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden />
                  Confirm your primary offer type and positioning.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden />
                  Share the economics behind your flagship experiences.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden />
                  Highlight the lead sources bringing buyers to you today.
                </li>
              </ul>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <label className={fieldLabelClasses} htmlFor="offer_type">
                    Type of business
                  </label>
                  <select
                    id="offer_type"
                    name="offer_type"
                    className={classNames(baseControlClasses, fieldErrors["offer_type"] && errorControlClasses)}
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
                  {fieldErrors["offer_type"] ? <p className={fieldErrorClasses}>{fieldErrors["offer_type"]}</p> : null}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={fieldLabelClasses} htmlFor="core_promise">
                      Core promise
                    </label>
                    <span className="text-xs font-medium text-indigo-500/80">
                      {corePromiseCharactersRemaining} characters left
                    </span>
                  </div>
                  <input
                    id="core_promise"
                    name="core_promise"
                    type="text"
                    maxLength={120}
                    placeholder="We help ___ achieve ___ in ___."
                    className={classNames(baseControlClasses, fieldErrors["core_promise"] && errorControlClasses)}
                    value={corePromise}
                    onChange={(event) => setCorePromise(event.target.value)}
                    required
                  />
                  {fieldErrors["core_promise"] ? <p className={fieldErrorClasses}>{fieldErrors["core_promise"]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className={fieldLabelClasses} htmlFor="avg_txn_value">
                    Average transaction value
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-400">
                      $
                    </span>
                    <input
                      id="avg_txn_value"
                      name="avg_txn_value"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      className={classNames(
                        baseControlClasses,
                        "pl-8",
                        fieldErrors["avg_txn_value"] && errorControlClasses,
                      )}
                      value={avgTransactionValue}
                      onChange={(event) => setAvgTransactionValue(event.target.value)}
                    />
                  </div>
                  {fieldErrors["avg_txn_value"] ? <p className={fieldErrorClasses}>{fieldErrors["avg_txn_value"]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className={fieldLabelClasses} htmlFor="revenue_band">
                    Annual revenue band
                  </label>
                  <select
                    id="revenue_band"
                    name="revenue_band"
                    className={classNames(baseControlClasses, fieldErrors["revenue_band"] && errorControlClasses)}
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
                  {fieldErrors["revenue_band"] ? <p className={fieldErrorClasses}>{fieldErrors["revenue_band"]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className={fieldLabelClasses} htmlFor="traffic_source">
                    Primary traffic source
                  </label>
                  <select
                    id="traffic_source"
                    name="traffic_source"
                    className={classNames(baseControlClasses, fieldErrors["traffic_source"] && errorControlClasses)}
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
                  {fieldErrors["traffic_source"] ? <p className={fieldErrorClasses}>{fieldErrors["traffic_source"]}</p> : null}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="rounded-[28px] border border-purple-100/70 bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8 shadow-inner">
              <span className={classNames(subheadingClasses, "text-purple-500")}>Offers & delivery</span>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Showcase your lead offers</h2>
              <p className="mt-3 text-sm text-slate-600">
                Listing your three most important offers helps us tailor conversion playbooks, fulfillment guidance, and revenue
                layering recommendations.
              </p>
              <p className="mt-4 rounded-2xl border border-purple-200/60 bg-white/70 px-4 py-3 text-xs text-purple-700">
                <strong className="font-semibold">Tip:</strong> The flagship offer in slot 1 is required. Supporting and entry
                offers are optional but provide richer recommendations.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {offers.map((offer) => {
                const slotPath = `offers.${offer.slot - 1}.name`;
                const pricePath = `offers.${offer.slot - 1}.price_point`;
                const fulfillmentPath = `offers.${offer.slot - 1}.fulfillment_type`;
                const outcomePath = `offers.${offer.slot - 1}.primary_outcome`;
                return (
                  <div
                    key={offer.slot}
                    className="flex flex-col gap-5 rounded-[26px] border border-purple-200/60 bg-white/95 p-6 shadow-[0_18px_38px_rgba(126,58,242,0.08)]"
                  >
                    <header className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">Offer {offer.slot}</span>
                      <h3 className="text-base font-semibold text-slate-900">{offerTitleMap[offer.slot]}</h3>
                      {fieldErrors[slotPath] ? (
                        <p className="text-sm font-medium text-rose-500">{fieldErrors[slotPath]}</p>
                      ) : null}
                    </header>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={fieldLabelClasses} htmlFor={`offer-name-${offer.slot}`}>
                          Offer name
                        </label>
                        <input
                          id={`offer-name-${offer.slot}`}
                          name={`offers[${offer.slot}].name`}
                          type="text"
                          placeholder={offer.slot === 1 ? "Flagship program" : "Companion offer"}
                          className={classNames(baseControlClasses, fieldErrors[slotPath] && errorControlClasses)}
                          value={offer.name}
                          onChange={(event) => handleOfferChange(offer.slot, "name", event.target.value)}
                          required={offer.slot === 1}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className={fieldLabelClasses} htmlFor={`offer-price-${offer.slot}`}>
                            Price point
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-400">
                              $
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
                                baseControlClasses,
                                "pl-8",
                                fieldErrors[pricePath] && errorControlClasses,
                              )}
                              value={offer.price_point}
                              onChange={(event) => handleOfferChange(offer.slot, "price_point", event.target.value)}
                            />
                          </div>
                          {fieldErrors[pricePath] ? (
                            <p className="text-xs text-rose-500">{fieldErrors[pricePath]}</p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <label className={fieldLabelClasses} htmlFor={`offer-fulfillment-${offer.slot}`}>
                            Fulfillment style
                          </label>
                          <select
                            id={`offer-fulfillment-${offer.slot}`}
                            name={`offers[${offer.slot}].fulfillment_type`}
                            className={classNames(baseControlClasses, fieldErrors[fulfillmentPath] && errorControlClasses)}
                            value={offer.fulfillment_type}
                            onChange={(event) =>
                              handleOfferChange(
                                offer.slot,
                                "fulfillment_type",
                                event.target.value as OfferFormState["fulfillment_type"],
                              )
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
                      </div>

                      <div className="space-y-2">
                        <label className={fieldLabelClasses} htmlFor={`offer-outcome-${offer.slot}`}>
                          Primary outcome <span className="font-normal text-xs text-slate-500">(80 characters)</span>
                        </label>
                        <input
                          id={`offer-outcome-${offer.slot}`}
                          name={`offers[${offer.slot}].primary_outcome`}
                          type="text"
                          maxLength={80}
                          placeholder="What transformation does this offer deliver?"
                          className={classNames(baseControlClasses, fieldErrors[outcomePath] && errorControlClasses)}
                          value={offer.primary_outcome}
                          onChange={(event) => handleOfferChange(offer.slot, "primary_outcome", event.target.value)}
                        />
                        {fieldErrors[outcomePath] ? (
                          <p className="text-xs text-rose-500">{fieldErrors[outcomePath]}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,3fr)]">
            <div className="rounded-[28px] border border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 shadow-inner">
              <span className={classNames(subheadingClasses, "text-slate-500")}>Customer journey</span>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Clarify how clients stay engaged</h2>
              <p className="mt-3 text-sm text-slate-600">
                Detail retention structures and upsell paths to surface automation, nurture, and loyalty plays aligned to your
                current systems.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={fieldLabelClasses} htmlFor="retention_model">
                    Retention model
                  </label>
                  <select
                    id="retention_model"
                    name="retention_model"
                    className={classNames(baseControlClasses, fieldErrors["retention_model"] && errorControlClasses)}
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
                  <span className={fieldLabelClasses}>Do you offer upsells or downsells?</span>
                  <label className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={hasUpsells}
                      onChange={(event) => setHasUpsells(event.target.checked)}
                    />
                    <span>Yes, include upsells</span>
                  </label>
                </div>
              </div>

              {hasUpsells ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={fieldLabelClasses} htmlFor="upsell_name">
                      Existing upsell/downsell name
                    </label>
                    <input
                      id="upsell_name"
                      name="upsell_name"
                      type="text"
                      className={baseControlClasses}
                      value={upsellName}
                      onChange={(event) => setUpsellName(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClasses} htmlFor="upsell_timing">
                      When is it offered?
                    </label>
                    <input
                      id="upsell_timing"
                      name="upsell_timing"
                      type="text"
                      className={baseControlClasses}
                      value={upsellTiming}
                      onChange={(event) => setUpsellTiming(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/70 bg-slate-50/70 p-8">
            <span className={classNames(subheadingClasses, "text-slate-500")}>Mentor alignment</span>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Mentor notes &amp; momentum markers</h2>
            <p className="mt-3 text-sm text-slate-600">
              Share current wins, upcoming milestones, and support requests so your Mentor can tailor the next session.
            </p>
            <div className="mt-6 space-y-2">
              <label className={fieldLabelClasses} htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                placeholder="Mentor notes, goals, milestones, targets (30–90 days)"
                className={classNames(baseControlClasses, fieldErrors["notes"] && errorControlClasses, "resize-none")}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </section>

          {submissionError ? (
            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 px-5 py-4 text-sm font-medium text-rose-600">
              {submissionError}
            </div>
          ) : null}

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row">
            <p className="max-w-xl text-center md:text-left">
              Saving keeps your Mentor aligned with what&apos;s working now so Triumph can unlock the right plays next.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(79,70,229,0.35)] transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Return to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
