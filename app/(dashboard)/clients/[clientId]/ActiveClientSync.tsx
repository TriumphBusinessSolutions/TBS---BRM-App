"use client";

import { useEffect } from "react";

const ACTIVE_CLIENT_STORAGE_KEY = "tbs-active-client";

type ActiveClientSyncProps = {
  clientId: string;
  clientName: string;
};

export default function ActiveClientSync({ clientId, clientName }: ActiveClientSyncProps) {
  useEffect(() => {
    const trimmedName = clientName.trim();

    try {
      window.localStorage.setItem(
        ACTIVE_CLIENT_STORAGE_KEY,
        JSON.stringify({
          id: clientId,
          name: trimmedName.length > 0 ? trimmedName : clientName,
        }),
      );
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Unable to sync active client context", error);
      }
    }
  }, [clientId, clientName]);

  return null;
}
