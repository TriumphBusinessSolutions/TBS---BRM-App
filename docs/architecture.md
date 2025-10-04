## Architecture (Phase 0)
## Components

Web App: Next.js hosted on Vercel

Backend: Supabase (Auth, Database, Storage, Edge Functions)

Optional: External APIs later

## Diagram (components)

graph LR
    A[Next.js App on Vercel] --- B[Supabase Database]
    A --- C[Supabase Auth]
    A --- D[Supabase Storage]
    A --- E[Edge Functions]


## Login → Load Data → Save Flow

sequenceDiagram
    participant U as User
    participant W as Next.js App
    participant S as Supabase

    U->>W: open app + login
    W->>S: verify session (Auth)
    W->>S: select client's models
    S-->>W: send data
    U->>W: edit a value
    W->>S: update row
    S-->>W: confirm success

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
