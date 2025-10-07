import { getServerClient } from "../../lib/supabase-server";

export type MentorModelRow = {
  id: string;
  client_id: string;
  level: string | null;
  status: string | null;
  created_at: string | null;
};

export type MentorImplementationRow = {
  id: string;
  client_id: string;
  title: string | null;
  scheduled_for: string | null;
  status: string | null;
  notes: string | null;
};

export type MentorMessageRow = {
  id: string;
  client_id: string;
  body: string | null;
  sender_role: string | null;
  created_at: string | null;
  read_at: string | null;
};

export type MentorClientRow = {
  id: string;
  name: string;
};

export type MentorClient = MentorClientRow & {
  models: MentorModelRow[];
  implementations: MentorImplementationRow[];
  messages: MentorMessageRow[];
};

export type MentorDashboardData = {
  supabaseConfigured: boolean;
  clients: MentorClient[];
  errors: string[];
};

const IGNORABLE_SUPABASE_ERROR_CODES = new Set(["42P01", "42703"]);

function normalizeError(message: string) {
  if (/does not exist/i.test(message)) {
    return null;
  }
  if (message.toLowerCase().includes("fetch failed")) {
    return "We couldn’t reach the Triumph data service. Refresh or try again soon.";
  }
  return message;
}

function isIgnorableError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }
  if (error.code && IGNORABLE_SUPABASE_ERROR_CODES.has(error.code)) {
    return true;
  }
  if (error.message && /does not exist/i.test(error.message)) {
    return true;
  }
  return false;
}

function safeText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function safeDate(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

export async function loadMentorDashboardData(): Promise<MentorDashboardData> {
  const supabase = getServerClient();

  if (!supabase) {
    return {
      supabaseConfigured: false,
      clients: [],
      errors: [
        "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      ],
    };
  }

  const errors: string[] = [];

  const [clientsRes, modelsRes, implementationsRes, messagesRes] = await Promise.all([
    supabase.from("clients").select("id, name").order("name", { ascending: true }),
    supabase.from("models").select("id, client_id, level, status, created_at"),
    supabase
      .from("client_implementations")
      .select("id, client_id, title, scheduled_for, status, notes"),
    supabase
      .from("mentor_messages")
      .select("id, client_id, body, sender_role, created_at, read_at"),
  ]);

  if (clientsRes.error) {
    const message = normalizeError(clientsRes.error.message);
    if (message) {
      errors.push(message);
    }
  }

  if (modelsRes.error) {
    const message = normalizeError(modelsRes.error.message);
    if (message) {
      errors.push(message);
    }
  }

  let implementations: MentorImplementationRow[] = [];
  if (implementationsRes.error) {
    if (!isIgnorableError(implementationsRes.error)) {
      const message = normalizeError(implementationsRes.error.message);
      if (message) {
        errors.push(message);
      }
    }
  } else {
    implementations = ((implementationsRes.data ?? []) as Record<string, unknown>[]).reduce<
      MentorImplementationRow[]
    >((acc, row) => {
      const id = safeText(row.id) ?? String(row.id ?? "");
      const clientId = safeText(row.client_id) ?? "";

      if (!id || !clientId) {
        return acc;
      }

      acc.push({
        id,
        client_id: clientId,
        title: safeText(row.title) ?? safeText((row as Record<string, unknown>)["name"]) ?? "Implementation task",
        scheduled_for: safeDate(row.scheduled_for) ?? safeDate((row as Record<string, unknown>)["scheduled_at"]),
        status: safeText(row.status) ?? safeText((row as Record<string, unknown>)["state"]),
        notes: safeText(row.notes),
      });

      return acc;
    }, []);
  }

  let messages: MentorMessageRow[] = [];
  if (messagesRes.error) {
    if (!isIgnorableError(messagesRes.error)) {
      const message = normalizeError(messagesRes.error.message);
      if (message) {
        errors.push(message);
      }
    }
  } else {
    messages = ((messagesRes.data ?? []) as Record<string, unknown>[])
      .map((row) => {
        const id = safeText(row.id) ?? String(row.id ?? "");
        const clientId = safeText(row.client_id) ?? "";

        if (!id || !clientId) {
          return null;
        }

        return {
          id,
          client_id: clientId,
          body: safeText(row.body) ?? safeText((row as Record<string, unknown>)["message"]),
          sender_role: safeText(row.sender_role) ?? safeText((row as Record<string, unknown>)["sender"]),
          created_at: safeDate(row.created_at) ?? safeDate((row as Record<string, unknown>)["inserted_at"]),
          read_at: safeDate(row.read_at) ?? safeDate((row as Record<string, unknown>)["read"]),
        } satisfies MentorMessageRow;
      })
      .filter((value): value is MentorMessageRow => value != null);
  }

  const clients = (clientsRes.data ?? []) as MentorClientRow[];
  const models = (modelsRes.data ?? []) as MentorModelRow[];

  const modelsByClient = new Map<string, MentorModelRow[]>();
  models.forEach((model) => {
    if (!model.client_id) {
      return;
    }
    const bucket = modelsByClient.get(model.client_id) ?? [];
    bucket.push(model);
    modelsByClient.set(model.client_id, bucket);
  });

  const implementationsByClient = new Map<string, MentorImplementationRow[]>();
  implementations.forEach((implementation) => {
    if (!implementation.client_id) {
      return;
    }
    const bucket = implementationsByClient.get(implementation.client_id) ?? [];
    bucket.push(implementation);
    implementationsByClient.set(implementation.client_id, bucket);
  });

  const messagesByClient = new Map<string, MentorMessageRow[]>();
  messages.forEach((message) => {
    if (!message.client_id) {
      return;
    }
    const bucket = messagesByClient.get(message.client_id) ?? [];
    bucket.push(message);
    messagesByClient.set(message.client_id, bucket);
  });

  const clientsWithRelations: MentorClient[] = clients.map((client) => ({
    ...client,
    models: (modelsByClient.get(client.id) ?? []).sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    }),
    implementations: (implementationsByClient.get(client.id) ?? []).sort((a, b) => {
      const aTime = a.scheduled_for ? Date.parse(a.scheduled_for) : 0;
      const bTime = b.scheduled_for ? Date.parse(b.scheduled_for) : 0;
      return aTime - bTime;
    }),
    messages: (messagesByClient.get(client.id) ?? []).sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    }),
  }));

  return {
    supabaseConfigured: true,
    clients: clientsWithRelations,
    errors,
  };
}
