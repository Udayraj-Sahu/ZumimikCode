"use client";

import { useEffect, useState } from "react";
import { CYAN, CYAN_06, CYAN_14, CYAN_22, EMERALD, SKY } from "@/lib/theme-tokens";
import { Copy, Share2, Check, Users2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useReferralStore } from "@/stores/referral-store";
import { cn } from "@/lib/utils";

const ACCENT = CYAN;

export function InviteCard() {
  const firstName = useOnboardingStore((s) => s.firstName);
  const { code, invitesSent, friendsJoined, ensureCode, markInvited } = useReferralStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ensureCode(firstName);
  }, [firstName, ensureCode]);

  const shareText = `Join me on Exam Arena — use my invite code ${code} to get started.`;

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
    <div
      className="relative overflow-hidden rounded-3xl border p-5 h-full"
      style={{ borderColor: CYAN_14, background: "linear-gradient(135deg, var(--cyan-05) 0%, var(--glass-02) 60%)" }}
    >
      <div className="absolute -top-12 -right-12 size-32 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, var(--cyan-45), transparent 70%)" }} />

      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${ACCENT}1A`, boxShadow: `inset 0 0 0 1px ${ACCENT}22` }}>
            <Users2 size={16} style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-[-0.02em] text-foreground leading-tight">Invite friends</p>
            <p className="text-[10.5px] text-muted-foreground/45 font-normal leading-tight">Share your code, earn bonus XP</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-micro text-muted-foreground/60 font-medium">
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">{invitesSent} invites</span>
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">{friendsJoined} joined</span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-xl border px-4 py-3 text-center" style={{ borderColor: CYAN_22, background: CYAN_06 }}>
          <span className="text-[16px] font-extrabold tracking-[0.14em] text-foreground select-all">{code ?? "—"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-[11px] font-bold text-[var(--on-accent)] transition-all active:scale-95"
          style={{ background: copied ? EMERALD : `linear-gradient(90deg, ${ACCENT}, ${SKY})` }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 text-[11px] font-bold text-foreground/80 transition-all hover:bg-white/[0.07] active:scale-[0.98]"
      >
        <Share2 size={14} className="text-[var(--cyan)]" />
        Share invite link
      </button>

      <p className="relative mt-3 text-micro text-muted-foreground/60 font-normal">
        Your friend gets a head start with 50 bonus XP when they sign up.
      </p>
    </div>
  );
}