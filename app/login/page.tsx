import Image from "next/image";
import type { Metadata } from "next";

import LoginForm from "./LoginForm";

const heroImageSrc =
  "https://drive.google.com/uc?export=view&id=1QBmt10l53-TTZIrYMz2DWE5d6ZzgpGhy";

export const metadata: Metadata = {
  title: "Sign in | Business Revenue Model App",
};

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(12,36,91,0.85)_0%,_rgba(3,7,18,0.95)_60%,_rgba(3,7,18,1)_100%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_120deg,_rgba(255,192,86,0.25)_0deg,_rgba(74,154,255,0.18)_120deg,_rgba(132,92,255,0.22)_240deg,_rgba(255,192,86,0.25)_360deg)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,150,64,0.45),transparent_45%),radial-gradient(circle_at_82%_76%,rgba(65,199,255,0.3),transparent_55%)] blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:28px_28px] opacity-20" />
        <div className="absolute inset-x-0 bottom-[-30%] h-[60%] bg-[radial-gradient(circle,_rgba(16,50,126,0.4)_0%,_rgba(3,7,18,0)_70%)]" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-12">
        <div className="relative w-full max-w-4xl">
          <div
            className="absolute inset-x-8 -top-24 h-40 rounded-[120px] bg-gradient-to-r from-[#ffb347]/40 via-[#5ca8ff]/35 to-[#9c6bff]/40 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-16 -bottom-28 h-48 rounded-[140px] bg-gradient-to-r from-[#61d1ff]/30 via-[#ff7e47]/35 to-[#6f6bff]/35 blur-[140px]"
            aria-hidden="true"
          />

          <div className="relative mx-auto flex w-full max-w-[960px] justify-center">
            <div className="group relative w-full">
              <div className="absolute inset-0 -translate-y-3 scale-[0.98] rounded-[34px] bg-gradient-to-br from-white/15 via-white/5 to-white/15 opacity-70 blur-2xl transition duration-700 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-90" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/10 shadow-[0_45px_120px_rgba(2,10,40,0.65)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_50%)]" aria-hidden="true" />

                <div className="relative grid gap-12 px-8 pb-12 pt-16 sm:px-12">
                  <div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center text-white">
                    <span className="mb-6 inline-flex items-center justify-center rounded-2xl bg-white/15 p-3 shadow-[0_18px_60px_rgba(3,12,45,0.55)] backdrop-blur">
                      <Image
                        src="/triumph-logo.svg"
                        alt="Triumph Business Solutions logo"
                        width={64}
                        height={64}
                        priority
                      />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.55em] text-[#ffd48f]">
                      Triumph Business Solutions
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-[2.4rem]">
                      Business Revenue Model App
                    </h1>
                    <p className="mt-4 max-w-lg text-sm text-white/80 sm:text-base">
                      Dive into a colourful control room tailored for visionaries and mentors to co-create profitable journeys.
                    </p>
                  </div>

                  <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_30px_120px_rgba(10,24,64,0.35)] transition duration-500 ease-out sm:p-10">
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(255,183,77,0.16),transparent_70%)]" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(160deg,rgba(96,143,255,0.12)_0%,rgba(255,255,255,0)_55%)]" aria-hidden="true" />
                    <div className="absolute -top-24 right-12 hidden h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(109,204,255,0.45),transparent_65%)] blur-3xl sm:block" aria-hidden="true" />
                    <div className="absolute -bottom-28 left-10 hidden h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,132,80,0.32),transparent_68%)] blur-3xl sm:block" aria-hidden="true" />
                    <div className="relative">
                      <div className="mb-10 flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                          <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-[#1d2c6b] via-[#2b1d64] to-[#41126d] shadow-[0_16px_40px_rgba(15,31,82,0.45)]">
                            <Image
                              src={heroImageSrc}
                              alt="Triumph Business Solutions safari illustration"
                              fill
                              sizes="80px"
                              className="object-cover"
                              priority
                              unoptimized
                            />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#122550] sm:text-xl">
                              Welcome to the Triumph portal
                            </h2>
                            <p className="mt-1 text-sm text-[#4a5579]">
                              Choose your path below to sign in or request fresh access.
                            </p>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="rounded-full border border-[#e3e8ff] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#33406c] shadow-[0_14px_36px_rgba(35,62,140,0.18)]">
                            Secure mentor approvals
                          </div>
                        </div>
                      </div>

                      <LoginForm supabaseConfigured={supabaseConfigured} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
