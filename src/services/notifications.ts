import { NOTIFICATIONS } from "@/lib/mock/notifications";
import type { NotificationItem } from "@/lib/types/notifications";
import { apiGet } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getNotifications(): Promise<NotificationItem[]> {
  if (IS_MOCK) {
    await delay(200);
    return NOTIFICATIONS;
  }
  return apiGet<NotificationItem[]>("/notifications");
}
