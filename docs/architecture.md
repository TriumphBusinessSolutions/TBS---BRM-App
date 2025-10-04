# Architecture (Phase 0)

## Components
- Web App: Next.js (Vercel)
- Backend: Supabase (Auth, Postgres, Storage, Edge Functions)
- Optional: External APIs later

## Diagram (components)
```mermaid
graph LR
    A[Next.js App (Vercel)] --- B[(Supabase Postgres)]
    A --- C[Supabase Auth]
    A --- D[Supabase Storage]
    A --- E[Edge Functions (optional)]

Login → Load Data → Save Flow
sequenceDiagram
    participant U as User
    participant W as Next.js App
    participant S as Supabase

    U->>W: open app + login
    W->>S: verify session (Auth)
    W->>S: select client's models
    S-->>W: rows (models, milestones, kpis)
    U->>W: edit a value
    W->>S: update row
    S-->>W: success

Boundaries (simple rules)
Auth lives in Supabase.

Data lives in Postgres (Supabase).

Web app only talks to Supabase.

Row-Level Security (RLS) protects rows (owners see only their stuff; admins see all; coaches see assigned clients).

Non-functional notes
Security: RLS on every table before launch.

CI: GitHub Actions runs build + tests on every PR.

Observability: console logs + simple error states for now.

Links
Discovery: docs/discovery-brief.md
