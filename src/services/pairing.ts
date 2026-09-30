import type { PairingSession, PairingApproval } from "@/lib/types/pairing";
import { apiGet, apiPost } from "./api";
import { IS_MOCK } from "@/lib/config";
import {
  mockCreateSession,
  mockGetSession,
  mockScanSession,
  mockApproveSession,
} from "@/lib/mock/pairing";
import { delay } from "@/lib/mock/delay";

export async function createPairingSession(): Promise<PairingSession> {
  if (IS_MOCK) {
    await delay(300);
    return mockCreateSession();
  }
  return apiPost<PairingSession>("/pairing/session", { scope: "web-login" });
}

export async function pollPairingStatus(sessionId: string): Promise<PairingSession> {
  if (IS_MOCK) {
    await delay(200);
    const s = mockGetSession(sessionId);
    if (!s) throw new Error("Session not found");
    return s;
  }
  return apiGet<PairingSession>(`/pairing/session/${sessionId}`);
}

export async function scanPairingCode(code: string): Promise<boolean> {
  if (IS_MOCK) {
    await delay(200);
    return mockScanSession(code);
  }
  await apiPost<boolean>("/pairing/session/scan", { code });
  return true;
}

export async function approvePairing(code: string): Promise<PairingApproval> {
  if (IS_MOCK) {
    await delay(300);
    const result = mockApproveSession(code);
    if (!result) throw new Error("Approval failed — invalid code or expired session");
    return result;
  }
  return apiPost<PairingApproval>("/pairing/session/approve", { code });
}
