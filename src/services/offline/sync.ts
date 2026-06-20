import { db } from "./db";
import { useNetworkStore, type QueuedMutation } from "@/stores/network-store";

export async function cacheQueryData(key: string, data: unknown): Promise<void> {
  await db.dashboardCache.put({
    id: key,
    data,
    updatedAt: Date.now(),
  });
}

export async function syncAll(): Promise<void> {
  const queue = useNetworkStore.getState().syncQueue;
  if (!queue.length) return;

  const { removeFromQueue } = useNetworkStore.getState();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const results = await Promise.allSettled(
    queue.map(async (mutation: QueuedMutation) => {
      const res = await fetch(`${API_URL}/api/sync/${mutation.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mutation.payload),
      });
      if (!res.ok) throw new Error(`Sync failed for ${mutation.key}: ${res.status}`);
      return mutation;
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      removeFromQueue(result.value.id);
    }
  }
}
