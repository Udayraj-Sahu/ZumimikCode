import { LINKED_DEVICES } from "@/lib/mock/linked-devices";
import type { LinkedDevice } from "@/lib/types/linked-devices";
import { apiGet, apiPost } from "./api";
import { delay } from "@/lib/mock/delay";

import { IS_MOCK } from "@/lib/config";

export async function getLinkedDevices(): Promise<LinkedDevice[]> {
  if (IS_MOCK) {
    await delay(250);
    return LINKED_DEVICES;
  }
  return apiGet<LinkedDevice[]>("/pairing/sessions", {
    headers: { Accept: "application/json" },
  });
}

export async function revokeDevice(deviceId: string): Promise<void> {
  if (IS_MOCK) {
    await delay(300);
    return;
  }
  await apiPost<void>(`/pairing/session/${deviceId}/revoke`, {});
}