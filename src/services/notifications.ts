import { NOTIFICATIONS } from "@/lib/mock/notifications";
import type { NotificationItem } from "@/lib/types/notifications";
import { apiGet } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getNotifications(): Promise<NotificationItem[]> {
  if (IS_MOCK) {
    await delay(200);
    return NOTIFICATIONS;
  }
  return apiGet<NotificationItem[]>("/notifications");
}
