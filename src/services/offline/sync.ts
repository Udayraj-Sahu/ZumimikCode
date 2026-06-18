import { db } from "./db";

export async function cacheQueryData(key: string, data: unknown): Promise<void> {
  await db.dashboardCache.put({
    id: key,
    data,
    updatedAt: Date.now(),
  });
}

export async function syncAll(): Promise<void> {
  // Stub — will flush queued mutations when backend exists
}
