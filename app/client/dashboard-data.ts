import { getSupabaseClient } from "../../lib/supabase";
import type { KpiRow, MilestoneRow, ModelRow } from "./components/ModelPanel";

export type ClientRow = {
  id: string;
  name: string;
  business_information_completed_at?: string | null;
};

export type DashboardData = {
  supabaseConfigured: boolean;
  client: ClientRow | null;
  models: ModelRow[];
  milestones: MilestoneRow[];
  kpis: KpiRow[];
  showBusinessInformationPrompt: boolean;
  businessInformationFormHref: string;
  errors: string[];
};

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Something went wrong while contacting the Triumph service.";
}

function normalizeErrorMessage(message: string) {
  if (message.toLowerCase().includes("fetch failed")) {
    return "We couldn’t reach the Triumph data service. Please refresh or try again shortly.";
  }
  return message;
}

function normalizeErrors(errors: string[]) {
  return errors.map(normalizeErrorMessage);
}

const DEFAULT_FORM_HREF = "/client/settings";

export async function loadDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      supabaseConfigured: false,
      client: null,
      models: [],
      milestones: [],
      kpis: [],
      showBusinessInformationPrompt: false,
      businessInformationFormHref: DEFAULT_FORM_HREF,
      errors: normalizeErrors([
        "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      ]),
    };
  }

  const errors: string[] = [];
  let businessInfoFieldAvailable = true;
  let client: ClientRow | null = null;

  try {
    const initialClientResult = await supabase
      .from("clients")
      .select("id,name,business_information_completed_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<ClientRow>();

    if (initialClientResult.error) {
      if (initialClientResult.error.code === "42703") {
        businessInfoFieldAvailable = false;
        const fallbackClientResult = await supabase
          .from("clients")
          .select("id,name")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle<ClientRow>();

        if (fallbackClientResult.error) {
          errors.push(fallbackClientResult.error.message);
        } else {
          client = fallbackClientResult.data as ClientRow | null;
        }
      } else {
        errors.push(initialClientResult.error.message);
        client = initialClientResult.data as ClientRow | null;
      }
    } else {
      client = initialClientResult.data as ClientRow | null;
    }
  } catch (error) {
    errors.push(toErrorMessage(error));
  }

  if (!client) {
    return {
      supabaseConfigured: true,
      client: null,
      models: [],
      milestones: [],
      kpis: [],
      showBusinessInformationPrompt: false,
      businessInformationFormHref: DEFAULT_FORM_HREF,
      errors: normalizeErrors(errors),
    };
  }

  let models: ModelRow[] = [];
  let milestones: MilestoneRow[] = [];
  let kpis: KpiRow[] = [];

  try {
    const [modelsRes, milestonesRes, kpisRes] = await Promise.all([
      supabase
        .from("models")
        .select("id,client_id,level,status")
        .eq("client_id", client.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("milestones")
        .select("id,model_id,title,done")
        .order("created_at", { ascending: true }),
      supabase
        .from("kpis")
        .select("id,model_id,key,target,value,period")
        .order("period", { ascending: true }),
    ]);

    if (modelsRes.error) {
      errors.push(modelsRes.error.message);
    } else {
      models = (modelsRes.data ?? []) as ModelRow[];
    }

    if (milestonesRes.error) {
      errors.push(milestonesRes.error.message);
    } else {
      milestones = (milestonesRes.data ?? []) as MilestoneRow[];
    }

    if (kpisRes.error) {
      errors.push(kpisRes.error.message);
    } else {
      kpis = (kpisRes.data ?? []) as KpiRow[];
    }
  } catch (error) {
    errors.push(toErrorMessage(error));
  }

  const modelIds = new Set(models.map((model) => model.id));
  const filteredMilestones = milestones.filter((milestone) => modelIds.has(milestone.model_id));
  const filteredKpis = kpis.filter((kpi) => modelIds.has(kpi.model_id));

  const showBusinessInformationPrompt =
    businessInfoFieldAvailable && client.business_information_completed_at == null;

  return {
    supabaseConfigured: true,
    client,
    models,
    milestones: filteredMilestones,
    kpis: filteredKpis,
    showBusinessInformationPrompt,
    businessInformationFormHref: DEFAULT_FORM_HREF,
    errors: normalizeErrors(errors),
  };
}
