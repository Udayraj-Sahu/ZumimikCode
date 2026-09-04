export type PairingStatus = "pending" | "scanned" | "approved" | "expired";

export type PairingSession = {
  sessionId: string;
  code: string;
  status: PairingStatus;
  expiresAt: string;
  createdAt: string;
};

export type PairingApproval = {
  token: string;
  refreshToken: string;
  sessionId: string;
};
