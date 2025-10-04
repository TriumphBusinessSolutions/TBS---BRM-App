## Architecture (Phase 0)
## Components

Web App: Next.js hosted on Vercel

Backend: Supabase (Auth, Database, Storage, Edge Functions)

Optional: External APIs later

## Diagram (components)

```mermaid
graph LR
  A[Vercel] --> B[Supabase Postgres]
  A --> C{{Supabase Auth}}
  A --> D{{Supabase Storage}}
  A --> E{{Edge Functions}}
  B --- C
  B --- D
  B --- E
```

## Login → Load Data → Save Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App (Next.js)
    participant S as Supabase

    U->>W: Opens app and logs in
    W->>S: Sends credentials for verification
    S-->>W: Returns session token
    W->>S: Requests user/client data
    S-->>W: Returns models + milestones
    U->>W: Makes an edit or update
    W->>S: Saves change
    S-->>W: Confirms success
```

---

Boundaries (simple rules)

Authentication lives in Supabase.

Data lives in Supabase Postgres.

The web app only communicates through Supabase APIs.

Row-Level Security (RLS) ensures users see only their own data.

Non-functional notes

Security: turn on RLS before launch.

CI: GitHub Actions runs build + tests on each PR.

Logging: use console output for early debugging.

Links

Discovery: docs/discovery-brief.md
