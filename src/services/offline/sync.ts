import { db } from "./db";
import { useNetworkStore, type QueuedMutation } from "@/stores/network-store";

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export async function cacheQueryData(key: string, data: unknown): Promise<void> {
  await db.dashboardCache.put({
    id: key,
    data,
    updatedAt: Date.now(),
  });
}

export async function getCachedQueryData<T>(key: string): Promise<T | null> {
  const entry = await db.dashboardCache.get(key);
  return (entry?.data as T) ?? null;
}

export function queueMutation(key: string, payload: unknown): void {
  const mutation: QueuedMutation = {
    id: `${key}_${Date.now()}`,
    key,
    payload,
    timestamp: Date.now(),
  };
  useNetworkStore.getState().addToQueue(mutation);
}

export async function flushQueue(): Promise<void> {
  const queue = useNetworkStore.getState().syncQueue;
  if (queue.length === 0) return;

  for (const mutation of queue) {
    try {
      // Stub — real API call when backend exists
      await new Promise((r) => setTimeout(r, 50));
      useNetworkStore.getState().removeFromQueue(mutation.id);
    } catch {
      // Retry on next sync
    }
  }
}

export async function syncAll(): Promise<void> {
  await flushQueue();
}
