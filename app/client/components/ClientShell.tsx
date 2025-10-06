import Link from "next/link";
import type { ReactNode } from "react";

const cardGlowOne = "absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 bg-[#004aad]/35 blur-[160px]";
const cardGlowTwo = "absolute bottom-[-12rem] right-[-8rem] h-[520px] w-[520px] bg-[#fa9100]/25 blur-[180px]";
const cardGlowThree =
  "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(143,214,255,0.12),_transparent_65%)]";

const gearButtonClasses =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_25px_80px_rgba(1,9,30,0.55)] transition hover:border-white/30 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const gearIcon = (
  <svg
    aria-hidden="true"
    focusable="false"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 12a8.25 8.25 0 0 0-.108-1.334l2.107-1.623a.75.75 0 0 0 .174-.957l-2-3.464a.75.75 0 0 0-.908-.34l-2.487.83a8.313 8.313 0 0 0-2.309-1.334l-.375-2.606A.75.75 0 0 0 13.593.75h-3.186a.75.75 0 0 0-.743.63l-.375 2.606a8.313 8.313 0 0 0-2.309 1.334l-2.487-.83a.75.75 0 0 0-.908.34l-2 3.464a.75.75 0 0 0 .174.957L3.858 10.7A8.25 8.25 0 0 0 3.75 12c0 .45.037.893.108 1.334l-2.107 1.623a.75.75 0 0 0-.174.957l2 3.464a.75.75 0 0 0 .908.34l2.487-.83a8.313 8.313 0 0 0 2.309 1.334l.375 2.606a.75.75 0 0 0 .743.63h3.186a.75.75 0 0 0 .743-.63l.375-2.606a8.313 8.313 0 0 0 2.309-1.334l2.487.83a.75.75 0 0 0 .908-.34l2-3.464a.75.75 0 0 0-.174-.957L20.142 13.3c.071-.441.108-.884.108-1.334Z"
    />
  </svg>
);

type ClientShellProps = {
  children: ReactNode;
  navSlot?: ReactNode;
};

export default function ClientShell({ children, navSlot }: ClientShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={cardGlowOne} />
        <div className={cardGlowTwo} />
        <div className={cardGlowThree} />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-12 lg:px-6">
        <header className="mb-10 flex items-center justify-end">
          {navSlot ?? (
            <Link href="/client/settings" className={gearButtonClasses} aria-label="Open settings">
              {gearIcon}
            </Link>
          )}
        </header>
        <div className="flex flex-col gap-10">{children}</div>
      </div>
    </main>
  );
}
