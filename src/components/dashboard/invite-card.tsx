"use client";

import { useEffect, useState } from "react";
import { EMERALD } from "@/lib/theme-tokens";
import { GlassCard } from "@/components/ui/glass-card";
import { Share2, KeyRound, QrCode, Copy, Check } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useReferralStore } from "@/stores/referral-store";

const REWARD_XP = 50;

export function InviteCard() {
  const firstName = useOnboardingStore((s) => s.firstName);
  const { code, invitesSent, friendsJoined, ensureCode, markInvited } = useReferralStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ensureCode(firstName);
  }, [firstName, ensureCode]);

  const shareText = `Join me on Exam Arena — use my invite code ${code} to get started.`;
  const earnedXp = friendsJoined * REWARD_XP;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      markInvited();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!code) return;
    let shared = false;
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title: "Exam Arena invite", text: shareText, dialogTitle: "Invite friends" });
        shared = true;
      } else if (navigator.share) {
        await navigator.share({ title: "Exam Arena invite", text: shareText });
        shared = true;
      }
    } catch {
      shared = false;
    }
    if (shared) markInvited();
    else handleCopy();
  };

  return (
    <GlassCard className="h-full p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-05)] text-primary">
          <Share2 size={17} />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--emerald)]"
            style={{ boxShadow: "0 0 8px var(--emerald-50)" }}
          />
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            Invite friends &amp; family
          </h3>
        </div>

        <span className="shrink-0 rounded-full bg-[var(--emerald-10)] px-3 py-1.5 font-mono text-[11px] font-bold tracking-wide text-[var(--emerald)] ring-1 ring-[var(--emerald-20)]">
          +{REWARD_XP} XP
        </span>
      </div>

      {/* Invite code panel */}
      <div className="mt-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-02)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <KeyRound size={15} className="text-primary" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
              Invite Code
            </span>
          </div>
          <span className="rounded-md bg-[var(--emerald-10)] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--emerald)]">
            Active
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-full border border-[var(--glass-border)] bg-[var(--glass-05)] px-4">
            <span className="truncate select-all font-mono text-[13px] font-bold tracking-wider text-foreground">
              {code ?? "——————"}
            </span>
            <QrCode size={17} className="shrink-0 text-muted-foreground" />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex h-12 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-05)] px-5 font-mono text-[12px] font-bold uppercase tracking-wider text-foreground transition-all hover:bg-[var(--glass-07)] active:scale-95"
          >
            {copied ? <Check size={15} style={{ color: EMERALD }} /> : <Copy size={15} className="text-primary" />}
            <span style={copied ? { color: EMERALD } : undefined}>{copied ? "Done" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Invites" value={`${invitesSent}`} valueClass="text-foreground" />
        <Stat label="Joined" value={`${friendsJoined}`} valueClass="text-[var(--emerald)]" />
        <Stat label="Earned" value={`${earnedXp} XP`} valueClass="text-primary" />
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleShare}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2.5 rounded-full font-mono text-[13px] font-bold uppercase tracking-wide text-[var(--on-accent)] transition-all active:scale-[0.98]"
        style={{
          background: `linear-gradient(90deg, var(--cta-from), var(--cta-to))`,
          boxShadow: "0 0 24px var(--accent-30)",
        }}
      >
        <Share2 size={18} />
        Share invite link
      </button>

      <p className="mt-3 px-1 text-center font-mono text-[11px] leading-relaxed text-muted-foreground">
        Your friend gets a head start with {REWARD_XP} bonus XP when they sign up.
      </p>
    </GlassCard>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-02)] px-1 py-3.5">
      <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className={`mt-1.5 font-mono text-[12px] font-bold uppercase ${valueClass}`}>{value}</span>
    </div>
  );
}
