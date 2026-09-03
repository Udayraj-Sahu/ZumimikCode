"use client";

import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  Check,
  Copy,
  Lock,
  MonitorSmartphone,
  Smartphone,
  Swords,
  QrCode,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const ACCENT = "#C7F252";

function hash8(v: string): number {
  let h = 2166136261;
  for (let i = 0; i < v.length; i++) {
    h ^= v.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 256;
}

function QrGrid({ token }: { token: string }) {
  const grid = useMemo(() => {
    const size = 9;
    const cells: boolean[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const onEdge = r === 0 || r === size - 1 || c === 0 || c === size - 1;
        cells.push(onEdge || hash8(`${token}:${r}:${c}`) % 3 !== 0);
      }
    }
    return cells;
  }, [token]);

  return (
    <div className="grid grid-cols-9 gap-[3px] p-3 rounded-2xl bg-white">
      {grid.map((on, i) => (
        <div
          key={i}
          className="aspect-square rounded-[2px]"
          style={{ background: on ? "#111" : "rgba(0,0,0,0.06)" }}
        />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setToken = useAuthStore((s) => s.setToken);
  const router = useRouter();

  const [token] = useState<string>(() => {
    const arr = new Uint8Array(8);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  });
  const [linked, setLinked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const linkText = `Exam Arena Web Login\nOpen on your phone: https://examarena.app/link\nPairing code: ${token}`;

  useEffect(() => {
    if (isAuthenticated) return;
    const tl = gsap.fromTo(
      document.getElementById("auth-root"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
    return () => { tl.kill(); };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const simulateScan = () => {
    setLinked(true);
    setTimeout(() => setLoggingIn(true), 600);
    setTimeout(() => {
      setToken("web-session-login");
    }, 1600);
  };

  const displayName = "Champion";

  return (
    <main id="auth-root" className="relative flex min-h-dvh items-center justify-center bg-background overflow-hidden px-6" style={{ opacity: 0 }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #C7F252 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #22D3EE 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Swords size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-[0.15em] text-foreground">EXAM ARENA</h1>
            <span className="text-[9px] font-bold tracking-[0.3em] text-primary/60">WEB LOGIN</span>
          </div>
        </div>

        <div className="rounded-3xl border backdrop-blur-xl p-6" style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${ACCENT}1A` }}>
              <MonitorSmartphone size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-foreground leading-tight">Link with the app</p>
              <p className="text-[10.5px] text-muted-foreground/45 font-normal">Use your phone to scan &amp; sign in</p>
            </div>
          </div>

          {!linked ? (
            <>
              <div className="mt-5 flex justify-center">
                <div className="relative">
                  <QrGrid token={token} />
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "0 0 30px rgba(199,242,82,0.25) inset" }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button type="button" onClick={handleCopy} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-foreground/70 transition-all hover:bg-white/[0.07] active:scale-95">
                  {copied ? <Check size={13} className="text-[#34D399]" /> : <Copy size={13} />}
                  {copied ? "Code copied" : "Copy pairing code"}
                </button>
              </div>

              <ol className="mt-5 space-y-3">
                {[
                  { icon: Smartphone, text: "Open Exam Arena on your phone" },
                  { icon: QrCode, text: "Tap “Scan to login on web” on your device" },
                  { icon: Check, text: "Confirm the pairing to continue" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <div className="grid size-7 place-items-center rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <Icon size={13} className="text-foreground/60" />
                      </div>
                      <span className="text-[12px] text-muted-foreground/70 font-medium">{s.text}</span>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
              <div className="grid size-14 place-items-center rounded-2xl" style={{ background: "rgba(52,211,153,0.12)" }}>
                <Loader2 size={24} className={loggingIn && !isAuthenticated ? "animate-spin text-[#34D399]" : "text-[#34D399]"} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-foreground leading-tight">
                {loggingIn && !isAuthenticated ? "Linking and signing in..." : "Linked successfully"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/45 font-normal">
                {loggingIn && !isAuthenticated ? "Hold on, linking your browser..." : `Welcome back, ${displayName}`}
              </p>
            </div>
          )}

          {!linked && (
            <button
              type="button"
              onClick={simulateScan}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[12px] font-bold tracking-[0.02em] text-[#0A0C0A] transition-all active:scale-95"
              style={{ background: "linear-gradient(90deg, #C7F252, #9fd42f)" }}
            >
              Simulate scan on this device <ArrowRight size={15} />
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/35">
            <Lock size={11} />
            End-to-end secured pairing
          </div>
        </div>

        <p className="mt-5 text-center text-[10.5px] text-muted-foreground/35 leading-relaxed">
          Pairing your phone links this browser session to your Exam Arena account.<br />
          <span className="text-muted-foreground/50">Enjoy this summary? Great. You can lock a real backend in later.</span>
        </p>
      </div>
    </main>
  );
}
