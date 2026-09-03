"use client";

import { useEffect, useState } from "react";
import { Copy, Share2, Check, Users2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useReferralStore } from "@/stores/referral-store";
import { cn } from "@/lib/utils";

const ACCENT = "#C7F252";

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
    <div className="relative overflow-hidden rounded-3xl border p-5" style={{ borderColor: "rgba(199,242,82,0.16)", background: "linear-gradient(135deg, rgba(199,242,82,0.05) 0%, rgba(255,255,255,0.02) 60%)" }}>
      <div className="absolute -top-10 -right-10 size-28 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.4), transparent)" }} />

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}1A` }}>
            <Users2 size={15} style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-[-0.02em] text-foreground leading-tight">Invite friends</p>
            <p className="text-[10.5px] text-muted-foreground/45 font-normal leading-tight">Share your code, earn bonus XP</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground/35 font-medium">
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">{invitesSent} invites</span>
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">{friendsJoined} joined</span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-xl border px-4 py-3 text-center" style={{ borderColor: "rgba(199,242,82,0.22)", background: "rgba(199,242,82,0.06)" }}>
          <span className="text-[16px] font-extrabold tracking-[0.14em] text-primary select-all">{code ?? "—"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-[11px] font-bold text-[#0A0C0A] transition-all active:scale-95"
          style={{ background: copied ? "#34D399" : "linear-gradient(90deg, #C7F252, #9fd42f)" }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="relative mt-2.5">
        <button
          type="button"
          onClick={handleShare}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 text-[11px] font-bold text-foreground/80 transition-all hover:bg-white/[0.07] active:scale-[0.98]",
          )}
        >
          <Share2 size={14} className="text-[#22D3EE]" />
          Share invite link
        </button>
      </div>
    </div>
  );
}
