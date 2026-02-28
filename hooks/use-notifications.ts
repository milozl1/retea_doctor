"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/notifications?unread=true",
    fetcher,
    { refreshInterval: 30000 } // Poll every 30 seconds
  );

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
