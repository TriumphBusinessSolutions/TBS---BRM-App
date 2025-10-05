"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type PromptContextItem = {
  label: string;
  value: string;
};

type PromptGeneratorProps = {
  levelLabel: string;
  description: string;
  prompts: string[];
  contextItems?: PromptContextItem[];
};

function getRandomPrompt(prompts: string[], exclude?: string): string | null {
  if (prompts.length === 0) {
    return null;
  }

  if (!exclude) {
    const index = Math.floor(Math.random() * prompts.length);
    return prompts[index];
  }

  const filtered = prompts.filter((prompt) => prompt !== exclude);
  const source = filtered.length > 0 ? filtered : prompts;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

export default function PromptGenerator({
  levelLabel,
  description,
  prompts,
  contextItems = [],
}: PromptGeneratorProps) {
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (prompts.length === 0) {
      setCurrentPrompt(null);
      setHistory([]);
      return;
    }

    const firstPrompt = prompts[0];
    setCurrentPrompt(firstPrompt);
    setHistory([firstPrompt]);
  }, [prompts]);

  const hasPrompts = prompts.length > 0;

  const contextList = useMemo(() => contextItems.filter((item) => item.value.trim().length > 0), [contextItems]);

  const handleGenerate = useCallback(() => {
    if (!hasPrompts) {
      return;
    }

    const nextPrompt = getRandomPrompt(prompts, currentPrompt ?? undefined);
    if (!nextPrompt) {
      return;
    }

    setCurrentPrompt(nextPrompt);
    setHistory((prev) => {
      if (prev[0] === nextPrompt) {
        return prev;
      }
      const nextHistory = [nextPrompt, ...prev.filter((item) => item !== nextPrompt)];
      return nextHistory.slice(0, 5);
    });
  }, [currentPrompt, hasPrompts, prompts]);

  const promptHistory = useMemo(() => history.slice(1), [history]);

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{levelLabel}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </header>

      {contextList.length > 0 ? (
        <section className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client context</p>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            {contextList.map((item) => (
              <div key={`${item.label}-${item.value}`} className="grid grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] gap-3">
                <dt className="font-medium text-slate-600">{item.label}</dt>
                <dd className="text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!hasPrompts}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          Generate model idea
        </button>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Suggested prompt</p>
          <p className="mt-2 text-sm text-slate-900">
            {currentPrompt ?? "No prompts available for this level yet."}
          </p>
        </div>
      </section>

      {promptHistory.length > 0 ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recent prompts
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            {promptHistory.map((prompt) => (
              <li key={prompt} className="rounded-md border border-slate-100 bg-white px-3 py-2">
                {prompt}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
