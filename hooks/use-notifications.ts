import useSWR from "swr";

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR("/api/notifications", {
    refreshInterval: 30000,
  });

  const markAsRead = async (id: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
    } catch {
      // Silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      mutate();
    } catch {
      // Silently fail
    }
  };

  return {
    notifications: data?.notifications ?? [],
    count: data?.count ?? 0,
    error,
    isLoading,
    mutate,
    markAsRead,
    markAllAsRead,
  };
}
