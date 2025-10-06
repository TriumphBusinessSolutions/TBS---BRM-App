import type { Metadata } from "next";
import Link from "next/link";

import ClientShell from "../components/ClientShell";

export const metadata: Metadata = {
  title: "Client Settings | TBS BRM App",
};

const sectionCardClasses =
  "relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_45px_140px_rgba(1,9,30,0.45)] backdrop-blur";

const accountFields = [
  {
    label: "Primary email",
    value: "client@email.com",
    description: "Used for sign-in, mentor updates, and Triumph notifications.",
  },
  {
    label: "Contact number",
    value: "+1 (555) 123-4567",
    description: "Optional. Share a number for time-sensitive mentor outreach.",
  },
  {
    label: "Timezone",
    value: "Eastern Time (ET)",
    description: "Scheduling and milestone reminders follow this timezone.",
  },
];

const notificationPreferences = [
  {
    title: "Milestone nudges",
    description: "Receive weekly reminders for upcoming or overdue milestones.",
    defaultState: "On",
  },
  {
    title: "KPI digests",
    description: "Monthly scorecard of KPIs delivered to your inbox.",
    defaultState: "On",
  },
  {
    title: "Mentor session recaps",
    description: "Automatically send call summaries and action items after sessions.",
    defaultState: "On",
  },
];

const workspacePreferences = [
  {
    title: "Model display order",
    description: "Drag-and-drop models inside the dashboard to highlight the focus area you want first.",
  },
  {
    title: "Progress sharing",
    description: "Control if team members can view milestone check-ins and KPI performance.",
  },
  {
    title: "Data exports",
    description: "Download quarterly reports summarizing wins, momentum markers, and KPI deltas.",
  },
];

const businessInformationActions = [
  {
    title: "Update business profile",
    description: "Jump to the dashboard form to share offers, ICP details, and program notes.",
    actionLabel: "Open profile",
    href: "/client#business-profile",
  },
  {
    title: "Share launch plans",
    description: "Upload supporting docs or notes so mentors can plan proactive outreach.",
    actionLabel: "Add resources",
    href: "#",
  },
];

export default function ClientSettingsPage() {
  return (
    <ClientShell>
      <section className={`${sectionCardClasses} px-8 py-12 md:px-12`}>
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-28 right-[-4rem] h-72 w-72 rounded-full bg-[#fa9100]/30 blur-[160px]" />
          <div className="absolute bottom-[-10rem] left-[-6rem] h-80 w-80 rounded-full bg-[#004aad]/35 blur-[180px]" />
        </div>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/80">
              Triumph settings hub
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold md:text-4xl">Manage your Triumph workspace</h1>
              <p className="text-sm leading-relaxed text-slate-200/80">
                Update account details, choose how Triumph keeps you informed, and tailor the dashboard experience to match your growth rhythm.
              </p>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-3 text-sm lg:w-auto">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-slate-100 shadow-[0_25px_80px_rgba(2,10,36,0.45)]">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Need help?</p>
              <p className="mt-2 text-base font-semibold text-white">Chat with the Triumph team</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-200/80">
                Email <a className="underline decoration-dotted underline-offset-2" href="mailto:support@triumph.com">support@triumph.com</a> for updates or troubleshooting.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-200 shadow-[0_25px_80px_rgba(2,10,36,0.45)]">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Workspace status</p>
              <p className="mt-2 text-base font-semibold text-white">All systems connected</p>
              <p className="mt-2 text-xs text-slate-300/80">No outstanding actions.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="personal-information" className={`${sectionCardClasses} px-8 py-10`}>
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-16 left-[-5rem] h-60 w-60 rounded-full bg-[#8fd6ff]/30 blur-[140px]" />
        </div>
        <div className="relative space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Account</p>
            <h2 className="text-2xl font-semibold text-slate-50">Personal details</h2>
            <p className="mt-2 text-sm text-slate-300/80">
              Keep your mentor in the loop with accurate contact information.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {accountFields.map((field) => (
              <div key={field.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_90px_rgba(1,9,30,0.4)]">
                <div className="pointer-events-none absolute inset-0 opacity-60">
                  <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                </div>
                <div className="relative space-y-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{field.label}</dt>
                  <dd className="text-base font-semibold text-slate-100">{field.value}</dd>
                  <p className="text-xs text-slate-300/80">{field.description}</p>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="business-information" className={`${sectionCardClasses} px-8 py-10`}>
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-12 right-[-4rem] h-60 w-60 rounded-full bg-[#fa9100]/25 blur-[130px]" />
        </div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Business</p>
              <h2 className="text-2xl font-semibold text-slate-50">Business information</h2>
              <p className="mt-2 text-sm text-slate-300/80">
                Keep the Triumph team aligned with your offers, launches, and positioning.
              </p>
            </div>
            <Link
              href="/client#model-generation"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              View dashboard section
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {businessInformationActions.map((action) => (
              <article
                key={action.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-[0_25px_90px_rgba(1,9,30,0.4)]"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-100">{action.title}</h3>
                  <p className="text-xs text-slate-300/80">{action.description}</p>
                </div>
                <Link
                  href={action.href}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {action.actionLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionCardClasses} px-8 py-10`}>
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-12 right-[-4rem] h-60 w-60 rounded-full bg-[#fa9100]/25 blur-[130px]" />
        </div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Notifications</p>
              <h2 className="text-2xl font-semibold text-slate-50">How you stay informed</h2>
              <p className="mt-2 text-sm text-slate-300/80">
                Choose the rhythm that keeps you accountable without the noise.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Email first
            </span>
          </div>
          <div className="space-y-4">
            {notificationPreferences.map((pref) => (
              <article
                key={pref.title}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-[0_25px_90px_rgba(1,9,30,0.4)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-100">{pref.title}</h3>
                  <p className="text-xs text-slate-300/80">{pref.description}</p>
                </div>
                <span className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                  {pref.defaultState}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionCardClasses} px-8 py-10`}>
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute bottom-[-8rem] left-[-4rem] h-64 w-64 rounded-full bg-[#004aad]/35 blur-[150px]" />
        </div>
        <div className="relative space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Workspace</p>
            <h2 className="text-2xl font-semibold text-slate-50">Dashboard preferences</h2>
            <p className="mt-2 text-sm text-slate-300/80">
              Fine-tune how your Triumph dashboard behaves for planning and review sessions.
            </p>
          </div>
          <div className="space-y-4">
            {workspacePreferences.map((preference) => (
              <article
                key={preference.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-[0_25px_90px_rgba(1,9,30,0.4)]"
              >
                <h3 className="text-base font-semibold text-slate-100">{preference.title}</h3>
                <p className="mt-2 text-xs text-slate-300/80">{preference.description}</p>
              </article>
            ))}
          </div>
          <p className="text-xs text-slate-400/80">
            Looking for something else? Reach out to your mentor or the Triumph team—we’re happy to configure the workspace with you.
          </p>
        </div>
      </section>
    </ClientShell>
  );
}
