# Role portals and dashboard destinations

This app relies on Supabase role claims to decide which workspace to show after login. The mapping logic lives in `lib/auth.ts` and drives the redirects from `/dashboard` and the login flow. At a glance:

| Role claim | Redirect destination | Top-level page component | Notes |
| --- | --- | --- | --- |
| `mentor_admin` | `/mentor/home` | [`app/mentor/home/page.tsx`](../app/mentor/home/page.tsx) | Loads mentor data and renders the shared mentor dashboard view. |
| `mentor` | `/mentor/home` | [`app/mentor/home/page.tsx`](../app/mentor/home/page.tsx) | Mentors and mentor admins land on the same workspace experience. |
| `client` | `/client` | [`app/client/page.tsx`](../app/client/page.tsx) | Shows the client-facing workspace with BRM progress, KPIs, and setup prompts. |
| _(fallback)_ | `/pending-approval` | _not yet implemented_ | When no role is present we redirect here until access is resolved. |

The redirect map comes from `ROLE_DESTINATION_MAP` inside `lib/auth.ts`, and the `resolveRoleRedirect` helper consolidates the role values from Supabase metadata or the `profiles` table before deciding where to send the user. Both the server-only `/dashboard` route and the `useRoleRedirect` client hook call this helper so the experience is consistent whether navigation happens during SSR or after an auth state change.

