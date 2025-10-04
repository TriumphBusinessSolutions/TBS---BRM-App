# Architecture (Phase 0)

## Components
- Web App: Next.js (Vercel)
- Backend: Supabase (Auth, Postgres, Storage, Edge Functions)
- Optional: External APIs later

## Diagram (components)
```mermaid
graph LR
  A[Next.js App (Vercel)] <---> B[(Supabase Postgres)]
  A <-- Auth --> C[Supabase Auth]
  A <-- Storage --> D[Supabase Storage]
  A <---> E[Edge Functions (optional)]


## Login → Load Data → Save Flow
```mermaid
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
