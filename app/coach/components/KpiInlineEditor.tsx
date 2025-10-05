"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabase";

type Props = {
  kpiId: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  onNotify: (type: "success" | "error", message: string) => void;
};

export default function KpiInlineEditor({
  kpiId,
  value,
  onValueChange,
  onNotify,
}: Props) {
  const [inputValue, setInputValue] = useState<string>(
    value !== null && value !== undefined ? String(value) : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value !== null && value !== undefined ? String(value) : "");
  }, [value]);

  const handleSave = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      onNotify("error", "Supabase is not configured.");
      return;
    }

    const trimmed = inputValue.trim();
    const parsedValue = trimmed === "" ? null : Number(trimmed);

    if (trimmed !== "" && Number.isNaN(parsedValue)) {
      setError("Please enter a numeric value.");
      onNotify("error", "Value must be a number.");
      return;
    }

    setError(null);
    setIsSaving(true);

    const previousValue = value ?? null;
    onValueChange(parsedValue);

    try {
      const { error: updateError } = await supabase
        .from("kpis")
        .update(
          // The generated Supabase types are placeholders at the moment, so cast to satisfy TS.
          { value: parsedValue } as never,
        )
        .eq("id", kpiId);

      if (updateError) {
        throw updateError;
      }

      onNotify("success", "KPI value updated.");
    } catch (updateError) {
      onValueChange(previousValue);
      setError("Could not save KPI value.");
      onNotify("error", "Failed to save KPI value.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        aria-label="KPI value"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving" : "Save"}
      </button>
      {error ? (
        <span className="text-xs text-rose-500">{error}</span>
      ) : null}
    </div>
  );
}
