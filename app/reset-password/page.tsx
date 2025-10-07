"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const supabase = getSupabaseClient();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("done");
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-lg shadow bg-white">
      <h1 className="text-xl font-semibold mb-4">Set a new password</h1>

      {status === "done" ? (
        <p className="text-green-700 font-medium">Password updated successfully! You can now log in.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            disabled={status === "saving"}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {status === "saving" ? "Updating…" : "Update password"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}
