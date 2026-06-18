import { db } from "./db";

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export async function cacheDashboardData(data: unknown): Promise<void> {
  await db.dashboardCache.put({
    id: "main",
    data,
    updatedAt: Date.now(),
  });
}

export async function getCachedDashboardData(): Promise<unknown | null> {
  const entry = await db.dashboardCache.get("main");
  return entry?.data ?? null;
}

export async function syncAll(): Promise<void> {
  // Stub — will wire to backend API sync later
}
