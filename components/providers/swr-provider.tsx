"use client";

import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((r) => r.json()),
        // Free-tier optimizations:
        // - Don't refetch when the user switches back to the tab
        revalidateOnFocus: false,
        // - Don't refetch when the browser comes back online (reduces Supabase hits)
        revalidateOnReconnect: false,
        // - Deduplicate identical requests within 60 seconds
        dedupingInterval: 60_000,
        // - Keep stale data while revalidating (avoids loading flash)
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
