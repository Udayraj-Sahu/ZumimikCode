"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Globe, Smartphone, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthPanelProps = {
  onAuthSuccess: (data: { name?: string; phone?: string; authMethod: "google" | "phone" }) => void;
};

export function AuthPanel({ onAuthSuccess }: AuthPanelProps) {
  const [mode, setMode] = useState<"select" | "phone-input" | "otp" | "verifying">("select");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
  }, [mode]);

  const handleGoogle = () => {
    onAuthSuccess({ name: "Google User", authMethod: "google" });
  };

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, "").length < 10) return;
    setMode("otp");
  };

  const handleOtpChange = (val: string, i: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
    const full = next.every((d) => d !== "");
    if (full) {
      setMode("verifying");
      setTimeout(() => {
        onAuthSuccess({ phone, authMethod: "phone" });
      }, 1000);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const phoneDigits = phone.replace(/\D/g, "");

  return (
    <div ref={contentRef} className="flex flex-col items-center gap-5">
      {mode === "select" && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 text-fluid-base font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Globe size={20} className="text-muted-foreground" />
            Continue with Google
          </button>
          <div className="flex w-full items-center gap-3 text-fluid-xs text-muted-foreground/40">
            <span className="flex-1 h-px bg-border" />
            <span>or</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <button
            type="button"
            onClick={() => setMode("phone-input")}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 text-fluid-base font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Smartphone size={20} className="text-muted-foreground" />
            Continue with Phone Number
          </button>
        </>
      )}

      {mode === "phone-input" && (
        <div className="w-full flex flex-col gap-4">
          <p className="text-fluid-sm font-semibold text-foreground/80">Enter your phone number</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-xl border border-border/60 bg-card px-3 py-3 text-fluid-sm font-medium text-foreground">
              <span className="text-muted-foreground">+91</span>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210"
              className="flex-1 rounded-xl border border-border/60 bg-card px-4 py-3 text-fluid-base text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={phoneDigits.length < 10}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-fluid-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none"
          >
            Send OTP <ArrowRight size={16} />
          </button>
        </div>
      )}

      {mode === "otp" && (
        <div className="w-full flex flex-col gap-4">
          <p className="text-fluid-sm text-foreground/60 text-center">
            OTP sent to <span className="font-semibold text-foreground">+91 {phone}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                className={cn(
                  "size-10 rounded-xl border text-center text-fluid-lg font-bold outline-none transition-colors",
                  d ? "border-primary bg-primary/5 text-foreground" : "border-border/60 bg-card text-foreground",
                )}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMode("phone-input")}
            className="text-center text-fluid-xs text-muted-foreground/50 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Change phone number
          </button>
        </div>
      )}

      {mode === "verifying" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-fluid-sm text-muted-foreground/60">Verifying OTP...</p>
        </div>
      )}
    </div>
  );
}
