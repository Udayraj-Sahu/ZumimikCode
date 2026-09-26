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
  return useMutation<boolean, Error, string>({
    mutationFn: (code) => scanPairingCode(code),
  });
}

export function useApprovePairing() {
  return useMutation<PairingApproval, Error, string>({
    mutationFn: (code) => approvePairing(code),
  });
}
