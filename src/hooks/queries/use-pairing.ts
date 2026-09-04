import { useMutation } from "@tanstack/react-query";
import {
  createPairingSession,
  pollPairingStatus,
  scanPairingCode,
  approvePairing,
} from "@/services/pairing";
import type { PairingSession, PairingApproval } from "@/lib/types/pairing";

export function useCreatePairingSession() {
  return useMutation<PairingSession, Error, void>({
    mutationFn: () => createPairingSession(),
  });
}

export function usePollPairingStatus() {
  return useMutation<PairingSession, Error, string>({
    mutationFn: (sessionId) => pollPairingStatus(sessionId),
  });
}

export function useScanPairingCode() {
  return useMutation<boolean, Error, { sessionId: string; code: string }>({
    mutationFn: ({ sessionId, code }) => scanPairingCode(sessionId, code),
  });
}

export function useApprovePairing() {
  return useMutation<PairingApproval, Error, { sessionId: string; code: string }>({
    mutationFn: ({ sessionId, code }) => approvePairing(sessionId, code),
  });
}
